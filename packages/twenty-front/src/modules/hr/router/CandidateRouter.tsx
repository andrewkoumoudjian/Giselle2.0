import { Route, Routes } from 'react-router-dom';
import { CandidateDashboard } from '../components/CandidateDashboard';
import { CandidateMatchingDashboard } from '../pages/CandidateMatchingDashboard';
import { HrDashboard } from '../pages/HrDashboard';

export const CandidateRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HrDashboard />} />
      <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
      <Route path="/candidate-matching" element={<CandidateMatchingDashboard />} />
    </Routes>
  );
}; 