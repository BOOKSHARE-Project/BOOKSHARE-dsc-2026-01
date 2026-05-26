import { UpdateUserDto } from '../dto/update-user.dto';
import { User, UserEntity } from '../entities/user.entity';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository {
  create(user: Partial<UserEntity>): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIdWithPendingFines(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  updateReputation(id: string, novaReputacao: number): Promise<void>;
 update(id: string, data: UpdateUserDto): Promise<User>;
}
