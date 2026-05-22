import { UserEntity } from '../entities/user.entity';

export const USERS_REPOSITORY = 'USERS_REPOSITORY';

export interface UsersRepository {
  create(user: Partial<UserEntity>): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByIdWithPendingFines(id: string): Promise<UserEntity | null>;
  updateReputation(id: string, novaReputacao: number): Promise<void>;
}
