import { RequestUser } from '../types/request-user';
export type PermissionAction = 'case:create' | 'case:read' | 'finding:create' | 'finding:read' | 'action:create' | 'action:approve' | 'evidence:download';
export interface ResourceScope {
    familyId?: string;
    caseId?: string;
    ownershipType?: 'own_content' | 'family_third_party' | 'external_third_party' | 'platform_copy' | 'search_result';
}
export declare class AuthorizationService {
    can(user: RequestUser, action: PermissionAction, resource: ResourceScope): boolean;
    assert(user: RequestUser, action: PermissionAction, resource: ResourceScope): void;
}
