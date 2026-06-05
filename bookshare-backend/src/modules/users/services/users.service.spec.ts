import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  UsersRepository,
  USERS_REPOSITORY,
} from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import {
  HASH_PROVIDER,
  HashProvider,
} from '../providers/hash-provider.interface';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '../../../common/exceptions/business.exceptions';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;
  let hashProvider: jest.Mocked<HashProvider>;

  beforeEach(async () => {
    const repositoryMock: Partial<UsersRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    const hashProviderMock: Partial<HashProvider> = {
      hash: jest.fn().mockImplementation(async (val) => `hashed_${val}`),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
    repository = module.get(USERS_REPOSITORY);
    hashProvider = module.get(HASH_PROVIDER);
  });

  // ---------- CREATE ----------
  describe('create', () => {
    it('should create a new user and return it, saving the password hashed', async () => {
      const dto: CreateUserDto = {
        nome: 'John Doe',
        email: 'john@example.com',
        senha: 'securePassword',
      };

      const createdUser = new UserEntity();
      createdUser.id = 'user-uuid';
      createdUser.nome = dto.nome;
      createdUser.email = dto.email;
      createdUser.senha = 'hashed_securePassword';
      createdUser.reputacao = 5.0;
      createdUser.hasMultasPendentes = false;
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();
      createdUser.deletedAt = null;

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);
      expect(result).toBe(createdUser);
      expect(hashProvider.hash).toHaveBeenCalledWith(dto.senha);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dto.nome,
          email: dto.email,
          senha: 'hashed_securePassword',
        }),
      );

      const savedUser = repository.create.mock.calls[0][0];
      expect(savedUser.senha).not.toBe(dto.senha);
      expect(savedUser.senha).toBe('hashed_securePassword');
    });

    it('should throw EmailAlreadyInUseException when email already exists', async () => {
      const dto: CreateUserDto = {
        nome: 'Jane',
        email: 'existing@example.com',
        senha: 'pw',
      };

      const existing = new UserEntity();
      existing.id = 'existing-id';
      repository.findByEmail.mockResolvedValue(existing);

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        EmailAlreadyInUseException,
      );
    });
  });

  // ---------- FIND BY ID ----------
  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.nome = 'Alice';
      user.email = 'alice@example.com';
      user.senha = 'pass';
      user.reputacao = 5.0;
      user.hasMultasPendentes = false;
      user.createdAt = new Date();
      user.updatedAt = new Date();
      user.deletedAt = null;

      repository.findById.mockResolvedValue(user);

      const result = await service.findById('user-123');
      expect(result).toBe(user);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });
  });
});
