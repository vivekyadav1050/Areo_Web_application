import { Activity, LayoutDashboard, LogOut, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  return <><div className={`sidebar-overlay ${open ? 'visible' : ''}`} onClick={onClose} /><aside className={`sidebar ${open ? 'sidebar-open' : ''}`}><div className="brand"><span className="brand-mark"><Activity size={22} /></span><div><strong>AP-20</strong><small>Patient Monitoring</small></div><button className="mobile-close" onClick={onClose} aria-label="Close navigation"><X size={20} /></button></div><div className="sidebar-section-label">WORKSPACE</div><nav className="side-nav"><NavLink end to="/dashboard" onClick={onClose}><LayoutDashboard size={18} />Dashboard</NavLink><NavLink to="/patients" onClick={onClose}><Users size={18} />All Patients</NavLink></nav><div className="sidebar-bottom"><div className="user-card"><span className="avatar avatar-user">{(user?.username || 'M').slice(0,1).toUpperCase()}</span><div><strong>{user?.username || 'Monitor user'}</strong><small>{user?.role || 'Monitor'}</small></div></div><button className="logout-button" onClick={() => { onClose(); logout(); }}><LogOut size={17} />Log out</button></div></aside></>;
}
