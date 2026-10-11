import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import StatusBadge from './StatusBadge';
import { displayValue, formatDate, getPatientStatus } from '../utils/patientStatus';

export default function PatientTable({ patients }) {
  if (!patients.length) return null;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Patient</th>
            <th>Patient ID</th>
            <th>Age / Sex</th>
            <th>Tablet ID</th>
            <th>SpO₂</th>
            <th>Pulse rate</th>
            <th>Status</th>
            <th>Last reading</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => {
            const status = getPatientStatus(p);
            const reading = p.latestReading || {};

            return (
              <tr key={p.id || p.patientId}>
                <td>
                  <div className="patient-cell">
                    <span className="avatar">
                      {(p.name || 'P').slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <strong>{p.name}</strong>
                      <small>Patient</small>
                    </span>
                  </div>
                </td>
                <td className="mono">{p.patientId || '—'}</td>
                <td>
                  {p.age ?? '—'} / {p.sex || '—'}
                </td>
                <td className="mono">{p.tabletId || '—'}</td>
                <td>
                  <strong>
                    {displayValue(reading.spo2)}
                    {reading.spo2 !== null ? '%' : ''}
                  </strong>
                </td>
                <td>
                  {displayValue(reading.pulseRate)}
                  {reading.pulseRate !== null ? ' BPM' : ''}
                </td>
                <td>
                  <StatusBadge status={status} />
                </td>
                <td>{formatDate(p.lastReadingAt)}</td>
                <td>
                  <Link
                    className="icon-link"
                    aria-label={`View ${p.name}`}
                    to={`/patients/${encodeURIComponent(p.id || p.patientId)}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
