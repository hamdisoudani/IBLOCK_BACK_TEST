import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}


    canActivate(context: ExecutionContext): boolean {

        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler()) || this.reflector.get<boolean>('isPublic', context.getClass());
        if(isPublic) return true;


        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler()) || this.reflector.get<string[]>('roles', context.getClass());
        if (!requiredRoles) { 
            return true; // No roles set for this route, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        return user.role && requiredRoles.includes(user.role); 
    }
}