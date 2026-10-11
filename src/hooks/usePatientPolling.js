import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPatients } from '../api/patientApi';
import { getErrorMessage } from '../api/axiosClient';

const POLL_MS = Math.max(5000, Number(import.meta.env.VITE_POLL_INTERVAL_MS) || 7000);
export default function usePatientPolling(enabled = true) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);

  const refresh = useCallback(async (manual = false) => {
    if (inFlight.current || !enabled || document.visibilityState === 'hidden') return;
    inFlight.current = true;
    if (manual) setRefreshing(true);
    try {
      const data = await fetchPatients();
      setPatients(data);
      setError('');
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); setRefreshing(false); inFlight.current = false; }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    refresh();
    const interval = window.setInterval(() => refresh(), POLL_MS);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', onVisible); };
  }, [enabled, refresh]);

  return { patients, loading, refreshing, error, refresh: () => refresh(true), setPatients };
}
