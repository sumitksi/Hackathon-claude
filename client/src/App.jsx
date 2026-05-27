import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import Jobs from './pages/Jobs';
import Interviews from './pages/Interviews';
import Analytics from './pages/Analytics';
import AISearch from './pages/AISearch';
import RejectionIntelligence from './pages/RejectionIntelligence';
import AuditLog from './pages/AuditLog';
import Profile from './pages/Profile';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidates/:id" element={<CandidateProfile />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="interviews" element={<Interviews />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="ai-search" element={<AISearch />} />
        <Route path="rejection-intelligence" element={<RejectionIntelligence />} />
        <Route path="profile" element={<Profile />} />
        <Route path="users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
        <Route path="audit-log" element={<ProtectedRoute roles={['admin']}><AuditLog /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
