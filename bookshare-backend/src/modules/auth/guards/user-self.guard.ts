import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class UserSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // RED Phase skeleton: returns true so unauthorized tests fail
    return true;
  }
}
