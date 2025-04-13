export enum AppPath {
  // Auth
  Verify = '/verify/:token',
  SignIn = '/sign-in',
  SignUp = '/sign-up',
  ResetPassword = '/reset-password/:token',
  Invite = '/invite/:workspaceInviteHash',
  Unsubscribe = '/unsubscribe',
  Auth = '/auth',

  // Settings
  Settings = '/settings',

  // HR Module
  HrLanding = '/hr',
  HrDashboard = '/hr/dashboard',
  CandidateMatching = '/hr/candidates',
  JobPostings = '/hr/jobs',
  Interviews = '/hr/interviews',
  CandidatePortal = '/hr/portal',
}