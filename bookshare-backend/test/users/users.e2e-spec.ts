import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';
import { JwtService } from '@nestjs/jwt';

describe('Users and Auth E2E Tests (12 corporate scenarios)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  // Global variables to transfer state between tests
  let globalToken: string;
  let userIdA: string;
  let userEmailA: string;
  let userIdB: string;
  let userEmailB: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Register global validation pipe and global exception filter
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    jwtService = app.get<JwtService>(JwtService);

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // ==========================================
  // BLOCO DE AUTENTICAÇÃO
  // ==========================================

  describe('Bloco de Autenticação', () => {
    it('1. Cadastro válido (201) - deve registrar um novo usuário com sucesso', async () => {
      userEmailA = `e2e.user.a.${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'User Test A',
          email: userEmailA,
          senha: 'Password123!',
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBe(userEmailA);
      expect(response.body.senha).toBeUndefined(); // Security: do not expose password

      userIdA = response.body.id;
    });

    it('2. Cadastro com e-mail duplicado (409) - deve impedir cadastro com e-mail em uso', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'Duplicate User',
          email: userEmailA,
          senha: 'AnotherPassword123!',
        })
        .expect(409);

      // Verify global exception filter output format
      expect(response.body).toEqual({
        success: false,
        statusCode: 409,
        message: expect.any(String),
        timestamp: expect.any(String),
        path: '/users',
      });
    });

    it('3. Login com credenciais válidas (200 + retorno de token) - deve obter access_token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmailA,
          senha: 'Password123!',
        })
        .expect(200);

      const token = response.body.accessToken || response.body.access_token;
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      globalToken = token;
    });

    it('4. Login com senha inválida (401) - deve rejeitar o login', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmailA,
          senha: 'wrong_password',
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        message: expect.any(String),
        timestamp: expect.any(String),
        path: '/auth/login',
      });
    });
  });

  // ==========================================
  // BLOCO DE USUÁRIOS
  // ==========================================

  describe('Bloco de Usuários', () => {
    it('5. Busca autenticada do perfil - deve retornar os dados do perfil com token válido', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userIdA}/profile`)
        .set('Authorization', `Bearer ${globalToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(userIdA);
      expect(response.body.email).toBe(userEmailA);
      expect(response.body.limiteLivros).toBe('3 livros'); // Reputation 5.0 yields 3 books limit
    });

    it('6. Busca sem autenticação (bloqueio) - deve impedir acesso ao perfil', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userIdA}/profile`)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        message: expect.any(String),
        timestamp: expect.any(String),
        path: `/users/${userIdA}/profile`,
      });
    });

    it('7. Atualização de dados - deve atualizar dados do próprio usuário com sucesso', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userIdA}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          nome: 'User Test A Updated',
        })
        .expect(200);

      expect(response.body.nome).toBe('User Test A Updated');
    });

    it('8. Remoção segura de registros - deve excluir o próprio usuário com sucesso', async () => {
      userEmailB = `e2e.user.b.${Date.now()}@example.com`;
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'User Test B',
          email: userEmailB,
          senha: 'Password123!',
        })
        .expect(201);
      userIdB = createRes.body.id;

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userEmailB,
          senha: 'Password123!',
        })
        .expect(200);
      const tokenB = loginRes.body.accessToken || loginRes.body.access_token;

      // Remove User B using their own token
      const response = await request(app.getHttpServer())
        .delete(`/users/${userIdB}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(response.body.message).toContain('removido com sucesso');

      // Verify User B is indeed deleted (calling with former token returns 404 because user is no longer found)
      await request(app.getHttpServer())
        .get(`/users/${userIdB}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404);
    });
  });

  // ==========================================
  // BLOCO DE SEGURANÇA
  // ==========================================

  describe('Bloco de Segurança', () => {
    it('9. Bloqueio total com Token Ausente (401) - deve retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userIdA}`)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        message: 'Token não fornecido.',
        timestamp: expect.any(String),
        path: `/users/${userIdA}`,
      });
    });

    it('10. Bloqueio com Token Inválido (401) - deve retornar 401', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userIdA}`)
        .set('Authorization', 'Bearer token-invalido-qualquer')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        message: 'Token inválido ou expirado.',
        timestamp: expect.any(String),
        path: `/users/${userIdA}`,
      });
    });

    it('11. Bloqueio com Token Expirado (401) - deve retornar 401', async () => {
      // Generate an expired token using JwtService
      const expiredToken = jwtService.sign(
        { sub: userIdA, email: userEmailA },
        { secret: process.env.JWT_SECRET || 'test-secret-key', expiresIn: '-10s' }
      );

      const response = await request(app.getHttpServer())
        .get(`/users/${userIdA}`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        statusCode: 401,
        message: 'Token inválido ou expirado.',
        timestamp: expect.any(String),
        path: `/users/${userIdA}`,
      });
    });

    it('12. Restrição de Perfil sem permissão via RBAC (403 Forbidden) - deve retornar 403', async () => {
      // Register User C
      const emailC = `e2e.user.c.${Date.now()}@example.com`;
      const createRes = await request(app.getHttpServer())
        .post('/users')
        .send({
          nome: 'User Test C',
          email: emailC,
          senha: 'Password123!',
        })
        .expect(201);
      const userIdC = createRes.body.id;

      // User A (globalToken) tries to access User C's details -> Forbidden
      const response = await request(app.getHttpServer())
        .get(`/users/${userIdC}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .expect(403);

      expect(response.body).toEqual({
        success: false,
        statusCode: 403,
        message: 'Acesso negado: você não tem permissão para acessar este recurso.',
        timestamp: expect.any(String),
        path: `/users/${userIdC}`,
      });
    });
  });
});
