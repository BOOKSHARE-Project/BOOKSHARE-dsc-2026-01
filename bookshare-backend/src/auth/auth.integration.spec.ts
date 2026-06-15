import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { UsersModule } from '../modules/users/users.module';
import { UsersService } from '../modules/users/services/users.service';
import { AuthService } from '../modules/auth/services/auth.service';
import { UserEntity } from '../modules/users/entities/user.entity';
import { EmailAlreadyInUseException } from '../common/exceptions/business.exceptions';

describe('AuthIntegration', () => {
  let moduleRef: TestingModule;
  let usersService: UsersService;
  let authService: AuthService;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [UserEntity],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
      ],
    }).compile();

    usersService = moduleRef.get<UsersService>(UsersService);
    authService = moduleRef.get<AuthService>(AuthService);
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

  it('Cenário 2: Deve autenticar com e-mail e senha válidos e retornar o access_token', async () => {
    const email = 'login.user@example.com';
    const senha = 'senhaSegura123';

    // Primeiro garantimos que o usuário de teste existe no banco
    await usersService.create({
      nome: 'Usuário Login',
      email,
      senha,
    });

    // Tentamos fazer login
    const result = await authService.login({
      email,
      senha,
    });

    // Asserções do token JWT de retorno
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe('string');
  });

  it('Cenário 3: Deve lançar erro ao tentar registrar um e-mail duplicado', async () => {
    const email = 'duplicado.user@example.com';

    // Registra o primeiro usuário
    await usersService.create({
      nome: 'Primeiro Usuário',
      email,
      senha: 'senhaSegura123',
    });

    // Tenta registrar o segundo com o mesmo e-mail
    const duplicateDto = {
      nome: 'Segundo Usuário',
      email,
      senha: 'outraSenha123',
    };

    // Esperamos que seja rejeitado com a exceção de negócio EmailAlreadyInUseException
    await expect(usersService.create(duplicateDto)).rejects.toThrow(
      EmailAlreadyInUseException,
    );
  });
});
