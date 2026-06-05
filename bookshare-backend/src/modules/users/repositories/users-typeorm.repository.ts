import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository.interface';
import { UserEntity } from '../entities/user.entity';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersTypeOrmRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeOrmRepo: Repository<UserEntity>,
  ) {}

  async create(user: Partial<UserEntity>): Promise<UserEntity> {
    const createdUser = this.typeOrmRepo.create(user);
    return await this.typeOrmRepo.save(createdUser);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return await this.typeOrmRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.typeOrmRepo.findOne({ where: { email } });
  }

  async findByIdWithPendingFines(id: string): Promise<UserEntity | null> {
    return await this.typeOrmRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.typeOrmRepo.find();
  }

  async updateReputation(id: string, novaReputacao: number): Promise<void> {
    await this.typeOrmRepo.update(id, { reputacao: novaReputacao });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    await this.typeOrmRepo.update(id, data);
    const entity = await this.typeOrmRepo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException('User not found');
    }
    return new User(
      entity.id,
      entity.nome,
      entity.email,
      entity.senha,
      entity.reputacao,
      entity.hasMultasPendentes,
    );
  }

  async remove(user: UserEntity): Promise<void> {
    await this.typeOrmRepo.remove(user);
  }
}
