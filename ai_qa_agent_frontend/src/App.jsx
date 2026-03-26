import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppLayout } from './components/layout/AppLayout';
import useAuthStore from './store/authStore';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserStoryInput from './pages/UserStoryInput';
import QAAnalysis from './pages/QAAnalysis';
import Metrics from './pages/Metrics';
import UserStories from './pages/UserStories';
import PRInput from './pages/PRInput';
import PRList from './pages/PRList';
import TestList from './pages/TestList';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="stories" element={<UserStories />} />
          <Route path="story-input" element={<UserStoryInput />} />
          <Route path="prs" element={<PRList />} />
          <Route path="pr-input" element={<PRInput />} />
          <Route path="qa-analysis" element={<QAAnalysis />} />
          <Route path="tests" element={<TestList />} />
          <Route path="metrics" element={<Metrics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
