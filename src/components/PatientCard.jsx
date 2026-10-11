import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { displayValue, formatDate, getPatientStatus } from '../utils/patientStatus';
export default function PatientCard({ patient }) {
  const reading = patient.latestReading || {};
  return <Link className="patient-card" to={`/patients/${encodeURIComponent(patient.id || patient.patientId)}`}><div className="patient-card-top"><span className="avatar">{(patient.name || 'P').slice(0,1).toUpperCase()}</span><ArrowUpRight size={17} /></div><h3>{patient.name}</h3><p className="muted">{patient.patientId} · {patient.age ?? '—'} years · {patient.sex || '—'}</p><StatusBadge status={getPatientStatus(patient)} /><div className="patient-card-metrics"><span><small>SpO₂</small><strong>{displayValue(reading.spo2)}{reading.spo2 !== null ? '%' : ''}</strong></span><span><small>Pulse</small><strong>{displayValue(reading.pulseRate)}{reading.pulseRate !== null ? ' BPM' : ''}</strong></span></div><small className="muted">Last reading: {formatDate(patient.lastReadingAt)}</small></Link>;
}
