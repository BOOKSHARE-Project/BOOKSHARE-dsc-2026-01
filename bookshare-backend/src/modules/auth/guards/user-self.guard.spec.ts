import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserSelfGuard } from './user-self.guard';

describe('UserSelfGuard', () => {
  let guard: UserSelfGuard;

  beforeEach(() => {
    guard = new UserSelfGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when routing id matches user sub', () => {
    const request = {
      params: {
        id: 'user-uuid-123',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when routing id does not match user sub', () => {
    const request = {
      params: {
        id: 'different-uuid',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este recurso.',
      ),
    );
  });

  it('should throw ForbiddenException when user is not present in request', () => {
    const request = {
      params: {
        id: 'user-uuid-123',
      },
      user: undefined,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
