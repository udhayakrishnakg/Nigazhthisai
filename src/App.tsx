import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { RoutesList } from './pages/operations/RoutesList';
import { StopsList } from './pages/operations/StopsList';
import { BusesList } from './pages/operations/BusesList';
import { TripsList } from './pages/operations/TripsList';
import { OperationalAlerts } from './pages/operations/OperationalAlerts';
import { SOSEmergencyCenter } from './pages/operations/SOSEmergencyCenter';
import { OperationalPipeline } from './pages/operations/OperationalPipeline';
import { LiveMonitoring } from './pages/LiveMonitoring';
import { Revenue } from './pages/Revenue';
import { Users } from './pages/Users';
import { ConductorPage } from './pages/Conductor';
import { PassengerPage } from './pages/Passenger';
import { 
  Settings, 
  Support 
} from './pages/Stubs';

import { LanguageProvider } from './lib/i18n';
import { CleanArchitectureProvider } from './contexts/CleanArchitectureContext';

import { isFeatureEnabled } from './lib/featureFlags';
import { toast } from 'sonner';

// Clear token on app initialization (refresh)
localStorage.removeItem('admin_token');

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  useLayout?: boolean;
  feature?: any;
}> = ({ children, useLayout = true, feature }) => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (feature && !isFeatureEnabled(feature)) {
    return <Navigate to="/dashboard" replace />;
  }

  return useLayout ? <MainLayout>{children}</MainLayout> : <>{children}</>;
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <CleanArchitectureProvider>
        <Router>
          <Toaster position="top-right" richColors />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute feature="DASHBOARD">
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/operations/stops" element={
            <ProtectedRoute feature="ROUTES">
              <StopsList />
            </ProtectedRoute>
          } />

          <Route path="/operations/routes" element={
            <ProtectedRoute feature="ROUTES">
              <RoutesList />
            </ProtectedRoute>
          } />

          <Route path="/operations/buses" element={
            <ProtectedRoute feature="BUSES">
              <BusesList />
            </ProtectedRoute>
          } />

          <Route path="/operations/trips" element={
            <ProtectedRoute feature="TRIPS">
              <TripsList />
            </ProtectedRoute>
          } />

          <Route path="/operations/alerts" element={
            <ProtectedRoute feature="ALERTS">
              <OperationalAlerts />
            </ProtectedRoute>
          } />

          <Route path="/operations/sos" element={
            <ProtectedRoute>
              <SOSEmergencyCenter />
            </ProtectedRoute>
          } />

          <Route path="/operations/setup" element={
            <ProtectedRoute>
              <OperationalPipeline />
            </ProtectedRoute>
          } />

          <Route path="/live" element={
            <ProtectedRoute feature="LIVE_MONITORING">
              <LiveMonitoring />
            </ProtectedRoute>
          } />

          <Route path="/revenue" element={
            <ProtectedRoute feature="REVENUE">
              <Revenue />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/support" element={
            <ProtectedRoute feature="SUPPORT">
              <Support />
            </ProtectedRoute>
          } />

          <Route path="/conductor" element={
            <ProtectedRoute useLayout={false}>
              <ConductorPage />
            </ProtectedRoute>
          } />
          
          <Route path="/passenger" element={
            <ProtectedRoute useLayout={false}>
              <PassengerPage />
            </ProtectedRoute>
          } />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </CleanArchitectureProvider>
    </LanguageProvider>
  );
};

export default App;
