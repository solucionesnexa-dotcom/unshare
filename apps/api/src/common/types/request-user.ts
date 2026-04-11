import { RoleCode } from './role-code';

export interface RequestUser {
  id: string;
  role: RoleCode;
  familyId?: string;
  assignedCaseIds?: string[];
}
