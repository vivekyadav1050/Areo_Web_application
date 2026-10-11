import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailsPage from './pages/PatientDetailsPage';
import ProtectedRoute from './routes/ProtectedRoute';
export default function App() {
  return <Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<DashboardPage />} /><Route path="/patients" element={<PatientsPage />} /><Route path="/patients/:patientId" element={<PatientDetailsPage />} /></Route><Route path="/" element={<Navigate to="/dashboard" replace />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes>;
}
