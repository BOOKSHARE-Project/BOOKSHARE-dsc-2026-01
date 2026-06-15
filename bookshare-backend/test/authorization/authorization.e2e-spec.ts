import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/users (GET) - should return 401 Unauthorized when no token is provided', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(401);
  });

  it('/users (GET) - should allow access with a valid token', async () => {
    const email = `e2e.security.${Date.now()}@example.com`;
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'Usuario E2E Seguranca',
        email,
        senha: password,
      })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email,
        senha: password,
      })
      .expect(200);

    const accessToken = loginRes.body.accessToken || loginRes.body.access_token;
    expect(accessToken).toBeDefined();

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/users (GET) - should return 401 Unauthorized when token is invalid or expired', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer token-totalmente-invalido-123')
      .expect(401);
  });

  it('/users/:id (GET) - should return 403 Forbidden when accessing another user profile (RBAC)', async () => {
    // 1. Cadastra e loga o Usuário A
    const emailA = `e2e.userA.${Date.now()}@example.com`;
    const password = 'password123';

    await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'User A',
        email: emailA,
        senha: password,
      })
      .expect(201);

    const loginResA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: emailA,
        senha: password,
      })
      .expect(200);

    const tokenA = loginResA.body.accessToken || loginResA.body.access_token;

    // 2. Cadastra o Usuário B (não precisamos logar nele, apenas obter seu ID)
    const emailB = `e2e.userB.${Date.now()}@example.com`;
    const userBRes = await request(app.getHttpServer())
      .post('/users')
      .send({
        nome: 'User B',
        email: emailB,
        senha: password,
      })
      .expect(201);

    const idB = userBRes.body.id;

    // 3. Usuário A tenta obter dados do Usuário B (GET /users/:id) -> Deve retornar 403 Forbidden
    await request(app.getHttpServer())
      .get(`/users/${idB}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(403);
  });
});
