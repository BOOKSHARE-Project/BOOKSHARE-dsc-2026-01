import { Injectable, Inject } from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
} from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import {
  HASH_PROVIDER,
  HashProvider,
} from '../providers/hash-provider.interface';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '../../../common/exceptions/business.exceptions';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(HASH_PROVIDER)
    private readonly hashProvider: HashProvider,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const emailExists = await this.usersRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new EmailAlreadyInUseException();
    }

    const hashedPassword = await this.hashProvider.hash(dto.senha);

    const novoUsuario = new User(
      crypto.randomUUID(),
      dto.nome,
      dto.email,
      hashedPassword,
      5.0,
      false,
    );

    return this.usersRepository.create(novoUsuario);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const userExists = await this.usersRepository.findById(id);
    if (!userExists) {
      throw new UserNotFoundException();
    }

    if (data.email && data.email !== userExists.email) {
      const emailExists = await this.usersRepository.findByEmail(data.email);
      if (emailExists) {
        throw new EmailAlreadyInUseException();
      }
    }

    const updateData = { ...data };
    if (data.senha) {
      updateData.senha = await this.hashProvider.hash(data.senha);
    }

    return this.usersRepository.update(id, updateData);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new UserNotFoundException();
    }
    await this.usersRepository.remove(user);
    return { message: 'Usuário removido com sucesso.' };
  }

  async getProfile(id: string): Promise<UserProfileResponseDto> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new UserNotFoundException();
    }

    let limiteLivros = '1 livro';
    let acessoSistema = 'Restrito';

    if (user.reputacao >= 3.0 && user.reputacao <= 3.9) {
      limiteLivros = '2 livros';
      acessoSistema = 'Normal';
    } else if (user.reputacao >= 4.0 && user.reputacao <= 5.0) {
      limiteLivros = '3 livros';
      acessoSistema = 'Total';
    }

    const statusMultas = user.hasMultasPendentes ? 'PENDENTE' : 'REGULAR';

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      reputacao: Number(user.reputacao),
      limiteLivros,
      acessoSistema,
      statusMultas,
    };
  }
}
