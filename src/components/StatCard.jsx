export default function StatCard({ label, value, icon: Icon, tone = 'teal', detail }) {
  return <article className="stat-card"><div className={`stat-icon tone-${tone}`}><Icon size={20} /></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div></article>;
}
