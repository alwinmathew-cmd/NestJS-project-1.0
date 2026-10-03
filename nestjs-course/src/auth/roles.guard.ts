import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../users/enums/user-role.enum';
import type { AuthedRequest } from './jwt-auth.guard';

const ROLES_KEY = 'roles';

// Usage: @Roles(UserRole.ADMIN)
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// Must run AFTER JwtAuthGuard (it needs request.user)
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<AuthedRequest>();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException(
        "You don't have permission to perform this action",
      );
    }
    return true;
  }
}
