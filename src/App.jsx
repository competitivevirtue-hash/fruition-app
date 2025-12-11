import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { AuthProvider } from './context/AuthContext';
import { FruitProvider } from './context/FruitContext';
import { NotificationProvider } from './context/NotificationContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <FruitProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/home" element={<Navigate to="/dashboard" replace />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
            </Routes>
          </Router>
        </NotificationProvider>
      </FruitProvider>
    </AuthProvider>
  );
}

export default App;
