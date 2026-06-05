import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    } as any;
    guard = new JwtAuthGuard(jwtService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true and set request.user when Bearer token is valid', async () => {
    const payload = { sub: 'user-uuid-123', nome: 'John Doe', email: 'john@example.com' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    const request = {
      headers: {
        authorization: 'Bearer valid-token-123',
      },
      user: undefined,
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(request.user).toBe(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token-123', {
      secret: expect.any(String),
    });
  });

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const request = {
      headers: {},
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token não fornecido.'),
    );
  });

  it('should throw UnauthorizedException when authorization type is not Bearer', async () => {
    const request = {
      headers: {
        authorization: 'Basic credentials-here',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido.'),
    );
  });

  it('should throw UnauthorizedException when token is malformed', async () => {
    const request = {
      headers: {
        authorization: 'Bearer ',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido.'),
    );
  });

  it('should throw UnauthorizedException when token verification fails (expired or invalid)', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    const request = {
      headers: {
        authorization: 'Bearer invalid-token',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Token inválido ou expirado.'),
    );
  });
});
