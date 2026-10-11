import { Menu, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
const headings = { '/dashboard': ['Dashboard', 'Live overview of your assigned patients'], '/patients': ['All Patients', 'View and monitor your authorized patient list'] };
export default function Header({ onMenu, onRefresh, refreshing, title, subtitle, actions }) {
  const location = useLocation(); const base = `/${location.pathname.split('/')[1]}`; const content = headings[base] || [];
  return <header className="topbar"><button className="menu-button" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button><div className="page-heading"><h1>{title || content[0] || 'Patient details'}</h1><p>{subtitle || content[1] || 'Patient monitoring and recent measurements'}</p></div><div className="topbar-actions">{actions}{onRefresh && <button className="button button-secondary" onClick={onRefresh} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spin' : ''} />Refresh</button>}</div></header>;
}
