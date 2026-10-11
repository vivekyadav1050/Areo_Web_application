import { Circle } from 'lucide-react';
import { getStatusLabel } from '../utils/patientStatus';
export default function StatusBadge({ status }) {
  const normalized = status || 'unknown';
  return <span className={`status-badge status-${normalized}`}><Circle size={7} fill="currentColor" />{getStatusLabel(normalized)}</span>;
}
