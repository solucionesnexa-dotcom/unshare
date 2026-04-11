import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { POLICY_RESOURCE_KEY } from '../decorators/policy-resource.decorator';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const resource = this.reflector.get<string>(POLICY_RESOURCE_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    req.policyResource = resource;
    return true;
  }
}
