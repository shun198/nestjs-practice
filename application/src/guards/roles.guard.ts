// https://docs.nestjs.com/security/authorization
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '../entity/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
        return false;
    }

    if (user.role === Role.Admin) {
      // Admin は Admin と General の両方を許可
      return requiredRoles.some((role) => role === Role.Admin || role === Role.General);
    } else if (user.role === Role.General) {
      // General は General のみ許可
      return requiredRoles.includes(Role.General);
    }

    return false;
  }
}
