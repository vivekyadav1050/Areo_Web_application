
import { Activity, HeartPulse, Radio, Users, AlertTriangle } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';

import Header from '../components/Header';
import StatCard from '../components/StatCard';
import PatientTable from '../components/PatientTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import usePatientPolling from '../hooks/usePatientPolling';
import {
  getPatientStatus,
  isCriticalReading,
} from '../utils/patientStatus';

export default function DashboardPage() {
  const { openMenu } = useOutletContext();

  const {
    patients,
    loading,
    refreshing,
    error,
    refresh,
  } = usePatientPolling(true);

  const counts = useMemo(
    () => ({
      total: patients.length,

      active: patients.filter(
        (p) => p.active
      ).length,

      online: patients.filter(
        (p) => getPatientStatus(p) === 'online'
      ).length,

      offline: patients.filter(
        (p) => getPatientStatus(p) === 'offline'
      ).length,

      critical: patients.filter(
        (p) => isCriticalReading(p)
      ).length,
    }),
    [patients]
  );

  const recent = useMemo(
    () =>
      [...patients]
        .sort(
          (a, b) =>
            new Date(b.lastReadingAt || 0).getTime() -
            new Date(a.lastReadingAt || 0).getTime()
        )
        .slice(0, 8),
    [patients]
  );

  return (
    <div className="page">
      <Header
        onMenu={openMenu}
        onRefresh={refresh}
        refreshing={refreshing}
      />

      {/* Dashboard statistics */}
      <section className="stats-grid">
        <StatCard
          label="Total patients"
          value={counts.total}
          icon={Users}
          tone="blue"
          detail="Authorized records"
        />

        <StatCard
          label="Active assignments"
          value={counts.active}
          icon={HeartPulse}
          tone="teal"
          detail="Currently assigned"
        />

        <StatCard
          label="Online"
          value={counts.online}
          icon={Radio}
          tone="green"
          detail="Fresh device activity"
        />

        <StatCard
          label="Offline"
          value={counts.offline}
          icon={Activity}
          tone="red"
          detail="No recent device activity"
        />

        <StatCard
          label="Critical readings"
          value={counts.critical}
          icon={AlertTriangle}
          tone="red"
          detail="Outside configured range"
        />
      </section>

      {/* Patient overview */}
      <section className="content-panel">
        <div className="panel-heading">
          <div>
            <h2>Patient monitoring overview</h2>
            <p>
              Most recently updated patient records
            </p>
          </div>

          <Link className="text-link" to="/patients">
            View all patients <span>→</span>
          </Link>
        </div>

        {loading ? (
          <LoadingState label="Loading patient records…" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={refresh}
          />
        ) : patients.length === 0 ? (
          <EmptyState />
        ) : (
          <PatientTable patients={recent} />
        )}
      </section>

      <div className="page-note">
        <Activity size={15} />

        Patient status is based on backend status or the
        most recent valid reading. Critical readings use
        configured adult resting ranges and are not a
        substitute for clinical assessment.
      </div>
    </div>
  );
}
