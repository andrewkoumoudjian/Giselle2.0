import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppPath } from '@/types/AppPath';
import { ComponentWithChildren } from '@/types/ComponentWithChildren';

import { AuthLayout } from '../AuthLayout';
import { DefaultLayout } from '../DefaultLayout';
import { SettingsLayout } from '../SettingsLayout';

// Lazy load HR module components
const HrDashboard = lazy(() => 
  import('@/modules/hr/pages/HrDashboard').then(module => ({ default: module.HrDashboard }))
);
const CandidateMatchingDashboard = lazy(() => 
  import('@/modules/hr/pages/CandidateMatchingDashboard').then(module => ({ default: module.CandidateMatchingDashboard }))
);
const CandidateDashboard = lazy(() => 
  import('@/modules/hr/components/CandidateDashboard').then(module => ({ default: module.CandidateDashboard }))
);
const HrIntegrationPage = lazy(() => 
  import('@/modules/hr/pages/HrIntegrationPage').then(module => ({ default: module.HrIntegrationPage }))
);
const LandingPage = lazy(() => 
  import('@/modules/hr/pages/LandingPage').then(module => ({ default: module.LandingPage }))
);

// Other lazy loaded components
const VerifyEffect = lazy(() => import('@/modules/auth/pages/VerifyEffect'));
const InviteEffect = lazy(() => import('@/modules/auth/pages/InviteEffect'));
const ResetPasswordEffect = lazy(() => import('@/modules/auth/pages/ResetPasswordEffect'));
const SignUpEffect = lazy(() => import('@/modules/auth/pages/SignUpEffect'));
const SignInEffect = lazy(() => import('@/modules/auth/pages/SignInEffect'));
const UnsubscribeEffect = lazy(() => import('@/modules/auth/pages/UnsubscribeEffect'));

// Auth-required wrapper component
const RequireAuth = ({ children }) => {
  // In a real app, we would check authentication here
  return children;
};

export const RouterProvider = ({ children }: ComponentWithChildren) => {
  return (
    <Routes>
      <Route path={AppPath.Verify} element={<VerifyEffect />} />
      <Route path={AppPath.Invite} element={<InviteEffect />} />
      <Route
        path={AppPath.ResetPassword}
        element={<ResetPasswordEffect />}
      />
      <Route path={AppPath.SignUp} element={<SignUpEffect />} />
      <Route path={AppPath.SignIn} element={<SignInEffect />} />
      <Route path={AppPath.Unsubscribe} element={<UnsubscribeEffect />} />
      
      {/* HR Landing Page - Public route */}
      <Route path={AppPath.HrLanding} element={<LandingPage />} />
      
      {/* HR Module with nested routes */}
      <Route
        path="/hr/*"
        element={
          <RequireAuth>
            <DefaultLayout>
              <HrIntegrationPage />
            </DefaultLayout>
          </RequireAuth>
        }
      >
        <Route path="dashboard" element={<HrDashboard />} />
        <Route path="candidates" element={<CandidateMatchingDashboard />} />
        <Route path="candidate-dashboard" element={<CandidateDashboard />} />
      </Route>
      
      {/* Other routes */}
      <Route path={AppPath.Settings + '/*'} element={<SettingsLayout />} />
      <Route path={AppPath.Auth + '/*'} element={<AuthLayout />} />
      <Route path="*" element={<Navigate to={AppPath.SignIn} />} />
    </Routes>
  );
};