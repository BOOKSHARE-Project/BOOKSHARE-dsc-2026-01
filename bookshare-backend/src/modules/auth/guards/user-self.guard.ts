import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

interface RequestWithUser {
  user?: {
    sub: string;
  };
  params?: {
    id?: string;
  };
}

@Injectable()
export class UserSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este recurso.',
      );
    }
    const id = request.params?.id;
    if (user.sub !== id) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este recurso.',
      );
    }
    return true;
  }
}
