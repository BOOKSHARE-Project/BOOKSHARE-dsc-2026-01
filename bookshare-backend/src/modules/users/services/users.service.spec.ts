import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import {
  UsersRepository,
  USERS_REPOSITORY,
} from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User, UserEntity } from '../entities/user.entity';
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
      findByIdWithPendingFines: jest.fn(),
      findAll: jest.fn(),
      updateReputation: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
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

  // ---------- FIND ALL ----------
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.nome = 'Alice';

      repository.findAll.mockResolvedValue([user]);

      const result = await service.findAll();
      expect(result).toEqual([user]);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  // ---------- UPDATE ----------
  describe('update', () => {
    it('should update user details and return the updated user', async () => {
      const existingUser = new UserEntity();
      existingUser.id = 'user-123';
      existingUser.nome = 'Alice';
      existingUser.email = 'alice@example.com';

      const updateDto = { nome: 'Alice Cooper' };
      const updatedUser = new User('user-123', 'Alice Cooper', 'alice@example.com', 'pass', 5.0, false);

      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateDto);
      expect(result).toBe(updatedUser);
      expect(repository.update).toHaveBeenCalledWith('user-123', updateDto);
    });

    it('should hash the password if it is provided during update', async () => {
      const existingUser = new UserEntity();
      existingUser.id = 'user-123';
      existingUser.nome = 'Alice';
      existingUser.email = 'alice@example.com';

      const updateDto = { senha: 'newSecurePassword' };
      const updatedUser = new User('user-123', 'Alice', 'alice@example.com', 'hashed_newSecurePassword', 5.0, false);

      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(updatedUser);

      await service.update('user-123', updateDto);

      expect(hashProvider.hash).toHaveBeenCalledWith('newSecurePassword');
      expect(repository.update).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ senha: 'hashed_newSecurePassword' }),
      );
    });

    it('should throw EmailAlreadyInUseException when new email belongs to another user', async () => {
      const existingUser = new UserEntity();
      existingUser.id = 'user-123';
      existingUser.nome = 'Alice';
      existingUser.email = 'alice@example.com';

      const updateDto = { email: 'another@example.com' };
      const anotherUser = new UserEntity();
      anotherUser.id = 'user-999';
      anotherUser.email = 'another@example.com';

      repository.findById.mockResolvedValue(existingUser);
      repository.findByEmail.mockResolvedValue(anotherUser);

      await expect(
        service.update('user-123', updateDto),
      ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    });

    it('should not throw EmailAlreadyInUseException when email belongs to the same user', async () => {
      const existingUser = new UserEntity();
      existingUser.id = 'user-123';
      existingUser.nome = 'Alice';
      existingUser.email = 'alice@example.com';

      const updateDto = { email: 'alice@example.com' };
      const updatedUser = new User('user-123', 'Alice', 'alice@example.com', 'pass', 5.0, false);

      repository.findById.mockResolvedValue(existingUser);
      repository.update.mockResolvedValue(updatedUser);

      await service.update('user-123', updateDto);
      expect(repository.update).toHaveBeenCalled();
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        service.update('nonexistent', { nome: 'Ghost' }),
      ).rejects.toBeInstanceOf(UserNotFoundException);
    });
  });

  // ---------- REMOVE ----------
  describe('remove', () => {
    it('should remove user when found', async () => {
      const user = new UserEntity();
      user.id = 'user-123';

      repository.findById.mockResolvedValue(user);
      repository.remove.mockResolvedValue(undefined);

      const result = await service.remove('user-123');
      expect(result).toEqual({ message: 'Usuário removido com sucesso.' });
      expect(repository.remove).toHaveBeenCalledWith(user);
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.remove('nonexistent')).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });
  });

  // ---------- GET PROFILE ----------
  describe('getProfile', () => {
    it('should return profile details with Total access and 3 book limit if reputation is high (4.0 - 5.0)', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.nome = 'Alice';
      user.email = 'alice@example.com';
      user.reputacao = 5.0;
      user.hasMultasPendentes = false;

      repository.findById.mockResolvedValue(user);

      const result = await service.getProfile('user-123');
      expect(result).toEqual({
        id: 'user-123',
        nome: 'Alice',
        email: 'alice@example.com',
        reputacao: 5.0,
        limiteLivros: '3 livros',
        acessoSistema: 'Total',
        statusMultas: 'REGULAR',
      });
    });

    it('should return profile details with Normal access and 2 book limit if reputation is mid (3.0 - 3.9)', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.nome = 'Alice';
      user.email = 'alice@example.com';
      user.reputacao = 3.5;
      user.hasMultasPendentes = false;

      repository.findById.mockResolvedValue(user);

      const result = await service.getProfile('user-123');
      expect(result).toEqual({
        id: 'user-123',
        nome: 'Alice',
        email: 'alice@example.com',
        reputacao: 3.5,
        limiteLivros: '2 livros',
        acessoSistema: 'Normal',
        statusMultas: 'REGULAR',
      });
    });

    it('should return profile details with Restrito access and 1 book limit if reputation is low (0.0 - 2.9)', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.nome = 'Alice';
      user.email = 'alice@example.com';
      user.reputacao = 2.0;
      user.hasMultasPendentes = false;

      repository.findById.mockResolvedValue(user);

      const result = await service.getProfile('user-123');
      expect(result).toEqual({
        id: 'user-123',
        nome: 'Alice',
        email: 'alice@example.com',
        reputacao: 2.0,
        limiteLivros: '1 livro',
        acessoSistema: 'Restrito',
        statusMultas: 'REGULAR',
      });
    });

    it('should return statusMultas PENDENTE when user has pending fines', async () => {
      const user = new UserEntity();
      user.id = 'user-123';
      user.reputacao = 4.5;
      user.hasMultasPendentes = true;

      repository.findById.mockResolvedValue(user);

      const result = await service.getProfile('user-123');
      expect(result.statusMultas).toBe('PENDENTE');
    });

    it('should throw UserNotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.getProfile('nonexistent')).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
    });
  });
});
