import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, ArrowLeft, HeartPulse, Radio, RefreshCw, Waves } from 'lucide-react';
import { Link, useOutletContext, useParams } from 'react-router-dom';

import { fetchPatient, fetchPatientHistory } from '../api/patientApi';
import { getErrorMessage } from '../api/axiosClient';
import Header from '../components/Header';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { displayValue, formatDate, formatTime, getPatientStatus } from '../utils/patientStatus';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const POLL_MS = Math.max(5000, Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 7000);

function MetricCard({ label, value, unit, icon: Icon, hint }) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        <span className="metric-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="metric-value">
        {value}
        <small>{value === '--' ? '' : unit}</small>
      </div>
      <p>{hint}</p>
    </article>
  );
}

export default function PatientDetailsPage() {
  const { patientId } = useParams();
  const { openMenu } = useOutletContext();

  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [range, setRange] = useState('1h');
  const [lastSuccess, setLastSuccess] = useState(null);


const refresh = useCallback(async (manual = false) => {
  if (document.visibilityState === "hidden") return;

  if (manual) setRefreshing(true);

  try {
    const [p, h] = await Promise.all([
      fetchPatient(patientId),
      fetchPatientHistory(patientId, 1, 100),
    ]);

    const patientData = h.patient
      ? {
          ...h.patient,
          latestReading: h.readings[0] ?? null,
          lastReadingAt: h.readings[0]?.timestamp ?? null,
          active: h.patient.isActive,
          assignmentDate: h.patient.date,
        }
      : p;

    setPatient(patientData);
    setHistory(h.readings);
    setError("");
    setHistoryError("");
    setLastSuccess(new Date());
  } catch (err) {
    if (!patient) {
      setError(getErrorMessage(err));
    } else {
      setHistoryError(getErrorMessage(err));
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [patientId, patient]);


  useEffect(() => {
    refresh();

    const id = window.setInterval(() => refresh(), POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refresh]);

  const chartData = useMemo(
    () => history.map((r) => ({ ...r, time: formatTime(r.timestamp) })).filter((r) => r.timestamp),
    [history],
  );

  if (loading) {
    return (
      <div className="page">
        <Header onMenu={openMenu} />
        <LoadingState label="Loading patient details…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Header onMenu={openMenu} />
        <ErrorState message={error} onRetry={() => refresh(true)} />
        <Link className="back-link" to="/patients">
          <ArrowLeft size={16} /> Back to patients
        </Link>
      </div>
    );
  }

  const reading = patient?.latestReading || {};
  const status = getPatientStatus(patient);
  const deviceStatusLabel =
    status === 'online'
      ? 'Online'
      : status === 'offline'
        ? 'Offline'
        : status === 'inactive'
          ? 'Inactive'
          : 'No data';

  return (
    <div className="page">
      <Header
        onMenu={openMenu}
        title="Patient details"
        subtitle="Current measurements and recent monitoring history"
        onRefresh={() => refresh(true)}
        refreshing={refreshing}
      />

      <Link className="back-link" to="/patients">
        <ArrowLeft size={16} /> Back to all patients
      </Link>

      <section className="patient-profile content-panel">
        <div className="profile-main">
          <span className="avatar avatar-large">{(patient.name || 'P').slice(0, 1).toUpperCase()}</span>
          <div>
            <h2>{patient.name}</h2>
            <p className="muted">
              Patient ID: <span className="mono">{patient.patientId}</span>
            </p>
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="profile-meta">
          <span>
            <small>Age / Sex</small>
            <strong>
              {patient.age ?? '—'} / {patient.sex || '—'}
            </strong>
          </span>
          <span>
            <small>Assigned tablet</small>
            <strong className="mono">{patient.tabletId || '—'}</strong>
          </span>
          <span>
            <small>Assignment date</small>
            <strong>{formatDate(patient.assignmentDate)}</strong>
          </span>
          <span>
            <small>Assignment</small>
            <strong>{patient.active ? 'Active' : 'Inactive'}</strong>
          </span>
        </div>
      </section>

      <div className="section-title-row">
        <div>
          <h2>Live monitoring</h2>
          <p>Latest valid values received from the backend</p>
        </div>
        <span className="updated-label">
          <span className="live-dot" /> Updated {lastSuccess ? formatTime(lastSuccess) : '—'}
        </span>
      </div>

      <section className="metrics-grid">
        <MetricCard
          label="Oxygen saturation"
          value={displayValue(reading.spo2)}
          unit="%"
          icon={Waves}
          hint="SpO₂"
        />
        <MetricCard
          label="Pulse rate"
          value={displayValue(reading.pulseRate)}
          unit="BPM"
          icon={HeartPulse}
          hint="Beats per minute"
        />
        <MetricCard
          label="Perfusion index"
          value={displayValue(reading.pi)}
          unit="%"
          icon={Activity}
          hint="Only when provided by device"
        />
        <MetricCard
          label="Device status"
          value={deviceStatusLabel}
          unit=""
          icon={Radio}
          hint={`Last reading: ${formatDate(patient.lastReadingAt)}`}
        />
      </section>

      <section className="content-panel chart-panel">
        <div className="panel-heading">
          <div>
            <h2>Monitoring history</h2>
            <p>Recent readings returned by the backend</p>
          </div>
          <select
            className="range-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="History range"
          >
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
          </select>
        </div>

        {historyError ? (
          <div className="inline-error">{historyError}</div>
        ) : chartData.length === 0 ? (
          <div className="chart-empty">
            <Activity size={24} />
            <strong>No monitoring data available yet</strong>
            <span>History appears after valid readings are received and the backend exposes them.</span>
          </div>
        ) : (
          <div className="charts-grid">
            <div className="chart-box">
              <h3>SpO₂ (%)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7edf2" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={25} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="spo2"
                    name="SpO₂"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>Pulse rate (BPM)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7edf2" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} minTickGap={25} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pulseRate"
                    name="Pulse rate"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <p className="chart-footnote">
          <RefreshCw size={13} /> Chart uses real backend history only. Time range options must be
          supported by your backend.
        </p>
      </section>

      <div className="page-note">
        <Activity size={15} /> This dashboard displays device measurements and is not a diagnostic tool.
      </div>
    </div>
  );
}

