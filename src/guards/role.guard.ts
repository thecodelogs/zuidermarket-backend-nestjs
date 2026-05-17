import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUserJwt } from '../user/interfaces/user-jwt.interface';
import { UserRole } from '../user/types/user-role.type';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const handlerRoles =
            this.reflector.get<UserRole[]>('roles', context.getHandler()) || [];
        const classRoles =
            this.reflector.get<UserRole[]>('roles', context.getClass()) || [];
        const roles = [...handlerRoles, ...classRoles];
        if (roles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user: IUserJwt = request.user;
        if (this.isAdmin(user)) {
            return true;
        }
        const hasRole = () =>
            user.roles.some((role: UserRole) => roles.includes(role));
        return user && user.roles && hasRole();
    }

    private isAdmin(user: IUserJwt) {
        return user?.roles?.includes('admin');
    }
}
