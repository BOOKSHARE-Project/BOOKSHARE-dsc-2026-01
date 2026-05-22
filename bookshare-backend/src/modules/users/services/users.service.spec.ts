import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository, USERS_REPOSITORY } from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const repositoryMock: Partial<UsersRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(USERS_REPOSITORY) as jest.Mocked<UsersRepository>;
  });

  // ---------- CREATE ----------
  describe('create', () => {
    it('should create a new user and return it', async () => {
      const dto: CreateUserDto = {
        nome: 'John Doe',
        email: 'john@example.com',
        senha: 'securePassword',
      };

      const createdUser = new UserEntity();
      createdUser.id = 'user-uuid';
      createdUser.nome = dto.nome;
      createdUser.email = dto.email;
      createdUser.senha = dto.senha;
      createdUser.reputacao = 5.0;
      createdUser.hasMultasPendentes = false;
      createdUser.createdAt = new Date();
      createdUser.updatedAt = new Date();
      createdUser.deletedAt = null;

      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(createdUser);

      const result = await service.create(dto);
      expect(result).toBe(createdUser);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: dto.nome,
          email: dto.email,
          senha: dto.senha,
        }),
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto: CreateUserDto = {
        nome: 'Jane',
        email: 'existing@example.com',
        senha: 'pw',
      };

      const existing = new UserEntity();
      existing.id = 'existing-id';
      repository.findByEmail.mockResolvedValue(existing);

      await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
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

    it('should throw NotFoundException when user does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
