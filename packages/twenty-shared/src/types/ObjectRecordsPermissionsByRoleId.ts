import { ObjectRecordsPermissions } from './index';

export type ObjectRecordsPermissionsByRoleId = {
  [roleId: string]: ObjectRecordsPermissions;
};
