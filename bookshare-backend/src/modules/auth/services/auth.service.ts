import { Injectable, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, UsersRepository } from '../../users/repositories/users.repository.interface';
import { HASH_PROVIDER, HashProvider } from '../../users/providers/hash-provider.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
    @Inject(HASH_PROVIDER)
    private readonly hashProvider: HashProvider,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    return { accessToken: '' };
  }
}
