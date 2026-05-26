import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersRepository } from './users.repository';
import { UserEntity } from '../entities/user.entity';
import { User } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersTypeOrmRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly typeOrmRepo: Repository<UserEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = this.typeOrmRepo.create(user);
    const savedUser = await this.typeOrmRepo.save(createdUser);
    return savedUser;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.typeOrmRepo.findOne({ where: { id } });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.typeOrmRepo.findOne({ where: { email } });
    return user;
  }

  async findByIdWithPendingFines(id: string): Promise<User | null> {
    const user = await this.typeOrmRepo.findOne({ where: { id } });
    return user;
  }

  async findAll(): Promise<User[]> {
    return await this.typeOrmRepo.find();
  }

  async updateReputation(id: string, novaReputacao: number): Promise<void> {
    await this.typeOrmRepo.update(id, { reputacao: novaReputacao });
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    await this.typeOrmRepo.update(id, data);
    return this.typeOrmRepo.findOne({ where: { id } });
  }

}
