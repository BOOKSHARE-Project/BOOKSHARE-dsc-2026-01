import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { AuthService } from '../modules/auth/services/auth.service';
import { UsersService } from '../modules/users/services/users.service';
import { EmailAlreadyInUseException } from '../common/exceptions/business.exceptions';

describe('AuthIntegration', () => {
  let moduleRef: TestingModule;
  let authService: AuthService;
  let usersService: UsersService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
        }),
        AuthModule,
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('Cenário 1: Deve registrar um novo usuário com sucesso e validar o e-mail', async () => {
    const dto = {
      nome: 'João Silva',
      email: 'joao.silva@example.com',
      senha: 'senhaSegura123',
    };

    const user = await usersService.create(dto);

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(dto.email);
  });

  it('Cenário 2: Deve autenticar com e-mail e senha válidos', async () => {
    const dto = {
      email: 'joao.silva@example.com',
      senha: 'senhaSegura123',
    };

    const result = await authService.login({
      email: dto.email,
      senha: dto.senha,
    });

    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe('string');
  });

  it('Cenário 3: Deve lançar erro ao registrar e-mail duplicado', async () => {
    const dto = {
      nome: 'João Silva Duplicado',
      email: 'joao.silva@example.com',
      senha: 'senhaSegura123',
    };

    await expect(usersService.create(dto)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
  });
});
