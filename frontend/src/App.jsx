import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useEffect } from 'react';
import Landing from './pages/Landing';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail'; 
import ProjectBugs from './pages/ProjectBugs';
// 🔐 Protected route wrapper
const Protected = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Checking session...</div>;
  return user ? children : <Navigate to="/auth?mode=login" replace />;
};

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);
  
  // 🔄 Restore auth state on mount
  useEffect(() => { initialize(); }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/projects/:id" element={<Protected><ProjectDetail /></Protected>} />
        <Route path="/projects/:id/bugs" element={<Protected><ProjectBugs /></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}