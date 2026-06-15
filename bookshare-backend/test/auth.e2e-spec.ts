import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const uniqueEmail = `e2e.auth.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
  const defaultPassword = 'password123';
  const defaultName = 'Teste E2E User';

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // 1. Cadastro de Usuário
  it('Cadastro de Usuário - deve registrar um novo usuário com sucesso (POST /users)', async () => {
    const payload = {
      nome: defaultName,
      email: uniqueEmail,
      senha: defaultPassword,
    };

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .expect(201);

    expect(response.body).toBeDefined();
    expect(response.body.email).toBe(uniqueEmail);
  });

  // 2. Impedir E-mail Duplicado
  it('Impedir E-mail Duplicado - deve impedir a criação de um usuário com o mesmo e-mail (POST /users)', async () => {
    const payload = {
      nome: 'Nome Alternativo',
      email: uniqueEmail,
      senha: defaultPassword,
    };

    await request(app.getHttpServer())
      .post('/users')
      .send(payload)
      .expect(409); // Retorna ConflictException (409) para e-mail duplicado
  });

  // 3. Realizar Login
  it('Realizar Login - deve fazer login com sucesso e armazenar o accessToken (POST /auth/login)', async () => {
    const payload = {
      email: uniqueEmail,
      senha: defaultPassword,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(200);

    // O backend retorna a propriedade "accessToken" no corpo da resposta
    const token = response.body.accessToken || response.body.access_token;
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    // Salva na variável global
    accessToken = token;
  });

  // 4. Rejeitar Senha Incorreta
  it('Rejeitar Senha Incorreta - deve rejeitar login com senha incorreta (POST /auth/login)', async () => {
    const payload = {
      email: uniqueEmail,
      senha: 'senhaErrada123',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(401); // Retorna UnauthorizedException (401)
  });
});
