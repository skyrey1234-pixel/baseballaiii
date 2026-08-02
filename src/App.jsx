import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import ProtectedRoute from '@/components/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import WarRoom from '@/pages/WarRoom';
import PitchPredictor from '@/pages/PitchPredictor';
import Players from '@/pages/Players';
import GameFilm from '@/pages/GameFilm';
import PitchLab from '@/pages/PitchLab';
import RepLab from '@/pages/RepLab';
import PitchDNA from '@/pages/PitchDNA';
import SwingStudio from '@/pages/SwingStudio';
import MistakeDNA from '@/pages/MistakeDNA';
import Passport from '@/pages/Passport';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/war-room" element={<WarRoom />} />
          <Route path="/pitch-predictor" element={<PitchPredictor />} />
          <Route path="/players" element={<Players />} />
          <Route path="/pitch-lab" element={<PitchLab />} />
          <Route path="/rep-lab" element={<RepLab />} />
          <Route path="/pitch-dna" element={<PitchDNA />} />
          <Route path="/swing-studio" element={<SwingStudio />} />
          <Route path="/mistake-dna" element={<MistakeDNA />} />
          <Route path="/passport" element={<Passport />} />
          <Route path="/game-film" element={<GameFilm />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App