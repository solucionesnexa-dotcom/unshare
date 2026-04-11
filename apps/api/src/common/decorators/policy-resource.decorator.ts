import { SetMetadata } from '@nestjs/common';

export const POLICY_RESOURCE_KEY = 'policy_resource';
export const PolicyResource = (resourceType: 'case' | 'finding' | 'action' | 'evidence' | 'minor') =>
  SetMetadata(POLICY_RESOURCE_KEY, resourceType);
