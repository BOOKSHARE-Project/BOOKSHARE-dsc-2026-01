import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { InvalidCredentialsException } from '../../../common/exceptions/business.exceptions';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const authServiceMock: Partial<AuthService> = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return accessToken on successful login', async () => {
      // Given
      const dto: LoginDto = {
        email: 'user@example.com',
        senha: 'correctPassword',
      };
      const response = { accessToken: 'valid-jwt-token' };
      authService.login.mockResolvedValue(response);

      // When
      const result = await controller.login(dto);

      // Then
      expect(result).toEqual(response);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate InvalidCredentialsException on login failure', async () => {
      // Given
      const dto: LoginDto = {
        email: 'user@example.com',
        senha: 'wrongPassword',
      };
      authService.login.mockRejectedValue(new InvalidCredentialsException());

      // When & Then
      await expect(controller.login(dto)).rejects.toThrow(
        InvalidCredentialsException,
      );
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });
});
