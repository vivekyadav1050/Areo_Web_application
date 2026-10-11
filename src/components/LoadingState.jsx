import { LoaderCircle } from 'lucide-react';
export default function LoadingState({ label = 'Loading data…' }) { return <div className="state-panel"><LoaderCircle className="spin" size={24} /><span>{label}</span></div>; }
