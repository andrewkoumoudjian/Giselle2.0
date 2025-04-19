import {
    IconBriefcase,
    IconCheckbox,
    IconFileAnalytics,
    IconUserCircle,
    IconUsers
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

type NavigationItem = {
  name: string;
  label: string;
  icon: React.ReactNode;
  path: string;
};

export const CandidateNavigationMenu = () => {
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    {
      name: 'hr-dashboard',
      label: 'HR Dashboard',
      icon: <IconFileAnalytics size={16} />,
      path: '/hr'
    },
    {
      name: 'candidates',
      label: 'Candidates',
      icon: <IconUserCircle size={16} />,
      path: '/hr/candidate-dashboard'
    },
    {
      name: 'candidate-matching',
      label: 'Candidate Matching',
      icon: <IconUsers size={16} />,
      path: '/hr/candidate-matching'
    },
    {
      name: 'job-postings',
      label: 'Job Postings',
      icon: <IconBriefcase size={16} />,
      path: '/hr/job-postings'
    },
    {
      name: 'applications',
      label: 'Applications',
      icon: <IconCheckbox size={16} />,
      path: '/hr/applications'
    }
  ];

  return (
    <div className="navigation-menu">
      {navigationItems.map((item) => (
        <div 
          key={item.name}
          className="navigation-item"
          onClick={() => navigate(item.path)}
        >
          <span className="icon">{item.icon}</span>
          <span className="label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}; 