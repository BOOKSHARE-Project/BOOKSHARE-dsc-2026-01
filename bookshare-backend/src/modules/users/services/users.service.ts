import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  USERS_REPOSITORY,
  UsersRepository,
} from '../repositories/users.repository.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const emailExists = await this.usersRepository.findByEmail(dto.email);
    if (emailExists) {
      throw new ConflictException('Este e-mail já está em uso.');
    }

    const novoUsuario = new User(
      crypto.randomUUID(),
      dto.nome,
      dto.email,
      dto.senha,
      5.0,
      false,
    );

    return this.usersRepository.create(novoUsuario);
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll();
  }
async update(id: string, data: UpdateUserDto): Promise<User> {
    const userExists = await this.usersRepository.findById(id);
    if (!userExists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return this.usersRepository.update(id, data);
  }
}
