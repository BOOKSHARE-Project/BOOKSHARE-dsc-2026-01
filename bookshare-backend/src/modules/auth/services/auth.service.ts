import { Injectable, Inject } from '@nestjs/common';
import { USERS_REPOSITORY, UsersRepository } from '../../users/repositories/users.repository.interface';
import { HASH_PROVIDER, HashProvider } from '../../users/providers/hash-provider.interface';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { InvalidCredentialsException } from '../../../common/exceptions/business.exceptions';

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
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const passwordMatches = await this.hashProvider.compare(dto.senha, user.senha);
    if (!passwordMatches) {
      throw new InvalidCredentialsException();
    }

    const payload = {
      sub: user.id,
      nome: user.nome,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
