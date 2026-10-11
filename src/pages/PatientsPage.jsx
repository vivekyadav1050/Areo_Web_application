import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import PatientTable from '../components/PatientTable';
import PatientCard from '../components/PatientCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import usePatientPolling from '../hooks/usePatientPolling';
import { getPatientStatus } from '../utils/patientStatus';
export default function PatientsPage() {
  const { openMenu } = useOutletContext(); const { patients, loading, refreshing, error, refresh } = usePatientPolling(true);
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all'); const [sort, setSort] = useState('recent');
  const visible = useMemo(() => patients.filter(p => { const q = query.trim().toLowerCase(); const matches = !q || [p.name, p.patientId, p.tabletId].some(v => String(v || '').toLowerCase().includes(q)); const status = getPatientStatus(p); return matches && (filter === 'all' || (filter === 'active' ? p.active : filter === 'inactive' ? !p.active : status === filter)); }).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : new Date(b.lastReadingAt || 0) - new Date(a.lastReadingAt || 0)), [patients, query, filter, sort]);
  return <div className="page"><Header onMenu={openMenu} onRefresh={refresh} refreshing={refreshing} /><section className="content-panel patients-panel"><div className="panel-heading"><div><h2>All patients</h2><p>{patients.length} authorized patient record{patients.length === 1 ? '' : 's'}</p></div></div><div className="toolbar"><div className="search-box"><Search size={17} /><input aria-label="Search patients" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, patient ID, tablet ID…" /></div><div className="filter-control"><SlidersHorizontal size={16} /><select aria-label="Filter patients" value={filter} onChange={e => setFilter(e.target.value)}><option value="all">All statuses</option><option value="online">Online</option><option value="offline">Offline</option><option value="no-data">No data</option><option value="active">Active assignments</option><option value="inactive">Inactive</option></select></div><select className="sort-select" aria-label="Sort patients" value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Most recent reading</option><option value="name">Name A–Z</option></select></div>{loading ? <LoadingState label="Loading patient records…" /> : error ? <ErrorState message={error} onRetry={refresh} /> : visible.length === 0 ? <EmptyState title="No matching patients" message="Try changing your search or status filter." /> : <><div className="desktop-patient-list"><PatientTable patients={visible} /></div><div className="mobile-patient-grid">{visible.map(p => <PatientCard key={p.id || p.patientId} patient={p} />)}</div><div className="results-count">Showing {visible.length} of {patients.length} patients</div></>}</section></div>;
}
