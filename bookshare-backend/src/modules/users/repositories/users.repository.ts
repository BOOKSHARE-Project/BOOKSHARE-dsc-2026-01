import { User } from '../entities/user.entity';

export abstract class UsersRepository {
  abstract create(user: User): Promise<User>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByIdWithPendingFines(id: string): Promise<User | null>;
  abstract updateReputation(id: string, novaReputacao: number): Promise<void>;
}