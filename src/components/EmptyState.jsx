import { Users } from 'lucide-react';
export default function EmptyState({ title = 'No patients found', message = 'Patients assigned to your account will appear here.' }) { return <div className="state-panel"><Users size={25} /><strong>{title}</strong><span>{message}</span></div>; }
