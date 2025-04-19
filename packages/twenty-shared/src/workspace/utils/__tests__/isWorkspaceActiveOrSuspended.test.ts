import { WorkspaceActivationStatus } from '../../types/WorkspaceActivationStatus';
import { isWorkspaceActiveOrSuspended } from '../isWorkspaceActiveOrSuspended';

describe('isWorkspaceActiveOrSuspended', () => {
  it('returns true for active workspaces', () => {
    expect(
      isWorkspaceActiveOrSuspended({
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      })
    ).toBe(true);
  });

  it('returns true for suspended workspaces', () => {
    expect(
      isWorkspaceActiveOrSuspended({
        activationStatus: WorkspaceActivationStatus.SUSPENDED,
      })
    ).toBe(true);
  });

  it('returns false for other workspace statuses', () => {
    expect(
      isWorkspaceActiveOrSuspended({
        activationStatus: WorkspaceActivationStatus.INACTIVE,
      })
    ).toBe(false);
    expect(
      isWorkspaceActiveOrSuspended({
        activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
      })
    ).toBe(false);
    expect(
      isWorkspaceActiveOrSuspended({
        activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
      })
    ).toBe(false);
  });

  it('returns false for null or undefined workspace', () => {
    expect(isWorkspaceActiveOrSuspended(null)).toBe(false);
    expect(isWorkspaceActiveOrSuspended(undefined)).toBe(false);
  });
});
