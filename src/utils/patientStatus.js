const FRESHNESS_SECONDS = Math.max(10, Number(import.meta.env.VITE_READING_FRESHNESS_SECONDS) || 90);
export function getPatientStatus(patient) {
  if (!patient?.active) return 'inactive';
  const backendStatus = String(patient?.status || '').toLowerCase();
  if (['online', 'offline', 'inactive', 'no data'].includes(backendStatus)) return backendStatus.replace(' ', '-');
  if (!patient?.lastReadingAt || Number.isNaN(new Date(patient.lastReadingAt).getTime())) return 'no-data';
  const ageSeconds = (Date.now() - new Date(patient.lastReadingAt).getTime()) / 1000;
  return ageSeconds >= 0 && ageSeconds <= FRESHNESS_SECONDS ? 'online' : 'offline';
}
export function getStatusLabel(status) {
  return ({ online: 'Online', offline: 'Offline', inactive: 'Inactive', 'no-data': 'No data' })[status] || 'Unknown';
}
export function formatDate(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
export function formatTime(value) {
  if (!value || Number.isNaN(new Date(value).getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(value));
}
export function displayValue(value) { return value === null || value === undefined || value === '' ? '--' : value; }

export function isCriticalReading(patient) {
  const reading = patient.latestReading;

  if (!reading) return false;

  const spo2 = Number(reading.spo2);
  const pulse = Number(reading.pulseRate);

  const criticalSpo2 =
    Number.isFinite(spo2) && spo2 < 95;

  const criticalPulse =
    Number.isFinite(pulse) &&
    (pulse < 60 || pulse > 100);

  return criticalSpo2 || criticalPulse;
}