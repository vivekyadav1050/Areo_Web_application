import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function ErrorState({ message, onRetry }) { return <div className="state-panel state-error"><AlertTriangle size={24} /><strong>Unable to load data</strong><span>{message}</span>{onRetry && <button className="button button-secondary" onClick={onRetry}><RefreshCw size={15} /> Retry</button>}</div>; }
