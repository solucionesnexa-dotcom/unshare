import { ForbiddenException, Injectable } from '@nestjs/common';
import { RequestUser } from '../types/request-user';

export type PermissionAction =
  | 'case:create'
  | 'case:read'
  | 'finding:create'
  | 'finding:read'
  | 'action:create'
  | 'action:approve'
  | 'evidence:download';

export interface ResourceScope {
  familyId?: string;
  caseId?: string;
  ownershipType?: 'own_content' | 'family_third_party' | 'external_third_party' | 'platform_copy' | 'search_result';
}

@Injectable()
export class AuthorizationService {
  can(user: RequestUser, action: PermissionAction, resource: ResourceScope): boolean {
    if (user.role === 'admin') return true;

    if (user.role === 'operator') {
      if (resource.caseId && user.assignedCaseIds && !user.assignedCaseIds.includes(resource.caseId)) return false;
      return true;
    }

    if (user.role === 'guardian') {
      if (resource.familyId && user.familyId !== resource.familyId) return false;
      return action !== 'action:approve' || Boolean(resource.caseId);
    }

    if (user.role === 'collaborator_limited') {
      if (action === 'evidence:download' || action === 'action:approve') return false;
      if (action === 'action:create') return resource.ownershipType === 'own_content';
      return action === 'finding:read' && resource.ownershipType === 'own_content';
    }

    return false;
  }

  assert(user: RequestUser, action: PermissionAction, resource: ResourceScope): void {
    if (!this.can(user, action, resource)) {
      throw new ForbiddenException('Access denied by RBAC/ABAC policy');
    }
  }
}
