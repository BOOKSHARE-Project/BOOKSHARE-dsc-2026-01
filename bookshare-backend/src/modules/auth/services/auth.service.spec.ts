import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { USERS_REPOSITORY, UsersRepository } from '../../users/repositories/users.repository.interface';
import { HASH_PROVIDER, HashProvider } from '../../users/providers/hash-provider.interface';
import { UserEntity } from '../../users/entities/user.entity';
import { InvalidCredentialsException } from '../../../common/exceptions/business.exceptions';
import { LoginDto } from '../dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let repository: jest.Mocked<UsersRepository>;
  let hashProvider: jest.Mocked<HashProvider>;

  beforeEach(async () => {
    const repositoryMock: Partial<UsersRepository> = {
      findByEmail: jest.fn(),
    };

    const hashProviderMock: Partial<HashProvider> = {
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret-key-12345',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: USERS_REPOSITORY,
          useValue: repositoryMock,
        },
        {
          provide: HASH_PROVIDER,
          useValue: hashProviderMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    repository = module.get(USERS_REPOSITORY) as jest.Mocked<UsersRepository>;
    hashProvider = module.get(HASH_PROVIDER) as jest.Mocked<HashProvider>;
  });

  describe('login', () => {
    it('should return a valid JWT token when credentials are correct', async () => {
      // Given
      const dto: LoginDto = {
        email: 'user@example.com',
        senha: 'correctPassword',
      };

      const user = new UserEntity();
      user.id = 'user-uuid-123';
      user.nome = 'John Doe';
      user.email = dto.email;
      user.senha = 'hashed_correctPassword';

      repository.findByEmail.mockResolvedValue(user);
      hashProvider.compare.mockResolvedValue(true);

      // When
      const result = await service.login(dto);

      // Then
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');

      // Verify and decode the JWT to check payload integrity
      const decodedPayload = jwtService.verify(result.accessToken);
      expect(decodedPayload).toMatchObject({
        sub: user.id,
        nome: user.nome,
        email: user.email,
      });
    });

    it('should throw InvalidCredentialsException when user is not found by email', async () => {
      // Given
      const dto: LoginDto = {
        email: 'nonexistent@example.com',
        senha: 'somePassword',
      };

      repository.findByEmail.mockResolvedValue(null);

      // When & Then
      await expect(service.login(dto)).rejects.toBeInstanceOf(InvalidCredentialsException);
    });

    it('should throw InvalidCredentialsException when password comparison fails', async () => {
      // Given
      const dto: LoginDto = {
        email: 'user@example.com',
        senha: 'wrongPassword',
      };

      const user = new UserEntity();
      user.id = 'user-uuid-123';
      user.nome = 'John Doe';
      user.email = dto.email;
      user.senha = 'hashed_correctPassword';

      repository.findByEmail.mockResolvedValue(user);
      hashProvider.compare.mockResolvedValue(false);

      // When & Then
      await expect(service.login(dto)).rejects.toBeInstanceOf(InvalidCredentialsException);
    });
  });
});
