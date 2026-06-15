import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AppService } from '../src/app.service';

describe('Error Handling and Exceptions (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let anotherAccessToken: string;
  let userId: string;
  let anotherUserId: string;

  const email = `error.test.${Date.now()}@example.com`;
  const anotherEmail = `error.test.another.${Date.now()}@example.com`;
  const password = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppService)
      .useValue({
        getHello: () => {
          throw new Error('Banco de dados inacessível ou erro técnico interno.');
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();

    // Register User A
    const registerResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'User Test Error Handling',
        email,
        senha: password,
      })
      .expect(201);
    userId = registerResponse.body.id;

    // Login User A
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        senha: password,
      })
      .expect(200);
    accessToken = loginResponse.body.accessToken || loginResponse.body.access_token;

    // Register User B
    const anotherRegisterResponse = await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'Another User Test',
        email: anotherEmail,
        senha: password,
      })
      .expect(201);
    anotherUserId = anotherRegisterResponse.body.id;

    // Login User B
    const anotherLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: anotherEmail,
        senha: password,
      })
      .expect(200);
    anotherAccessToken = anotherLoginResponse.body.accessToken || anotherLoginResponse.body.access_token;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // Helper to assert standard error response properties
  const assertStandardErrorResponse = (responseBody: any, expectedStatus: number, expectedMessageContains?: string) => {
    expect(responseBody).toBeDefined();
    expect(responseBody.success).toBe(false);
    expect(responseBody.statusCode).toBe(expectedStatus);
    expect(responseBody.message).toBeDefined();
    expect(typeof responseBody.message).toBe('string');
    if (expectedMessageContains) {
      expect(responseBody.message.toLowerCase()).toContain(expectedMessageContains.toLowerCase());
    }
    expect(responseBody.timestamp).toBeDefined();
    expect(new Date(responseBody.timestamp).getTime()).not.toBeNaN();
    expect(responseBody.path).toBeDefined();
  };

  // Scenario 1: NotFoundException (404)
  it('deve retornar NotFoundException formatado quando buscar livro inexistente (GET /books/:id)', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';
    const response = await request(app.getHttpServer())
      .get(`/books/${nonExistentId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);

    assertStandardErrorResponse(response.body, 404, 'Livro não encontrado');
    expect(response.body.path).toBe(`/books/${nonExistentId}`);
  });

  // Scenario 2: ConflictException (409)
  it('deve retornar ConflictException formatado quando cadastrar email duplicado (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'Duplicate Email User',
        email, // already used by User A
        senha: password,
      })
      .expect(409);

    assertStandardErrorResponse(response.body, 409, 'Este e-mail já está em uso');
    expect(response.body.path).toBe('/users');
  });

  // Scenario 3: UnauthorizedException (401)
  it('deve retornar UnauthorizedException formatado quando tentar logar com senha errada (POST /auth/login)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        senha: 'WrongPassword123!',
      })
      .expect(401);

    assertStandardErrorResponse(response.body, 401, 'Credenciais inválidas');
    expect(response.body.path).toBe('/auth/login');
  });

  // Scenario 4: ForbiddenException (403)
  it('deve retornar ForbiddenException formatado quando tentar acessar perfil de outro usuário (GET /users/:id)', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${anotherUserId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);

    assertStandardErrorResponse(response.body, 403, 'Acesso negado: você não tem permissão');
    expect(response.body.path).toBe(`/users/${anotherUserId}`);
  });

  // Scenario 5: Internal Server Error (500) & Internal Messages Removed
  it('deve remover mensagens internas e retornar erro 500 padronizado ao capturar exceção não-HTTP (GET /)', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(500);

    // Verify that the technical error message is hidden and a sanitized response is returned
    assertStandardErrorResponse(response.body, 500, 'Erro interno do servidor');
    expect(response.body.message).not.toContain('Banco de dados inacessível');
    expect(response.body.path).toBe('/');
  });

  // Scenario 6: Validation Error / BadRequestException (400)
  it('deve retornar BadRequestException formatado quando enviar payload inválido (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: '', // invalid
        email: 'invalid-email', // invalid
        senha: '', // invalid
      })
      .expect(400);

    assertStandardErrorResponse(response.body, 400);
    expect(response.body.path).toBe('/users');
  });
});
