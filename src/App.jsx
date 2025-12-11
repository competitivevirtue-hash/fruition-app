import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* The Dashboard handles its own internal "currentView" state, so we just route to it */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* Redirect /home to /dashboard for now as requested */}
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
      </Routes>
    </Router>
  );
}

export default App;
