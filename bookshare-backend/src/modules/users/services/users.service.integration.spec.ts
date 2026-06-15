import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersModule } from '../users.module';
import { AuthModule } from '../../auth/auth.module';
import { UserEntity } from '../entities/user.entity';
import {
  EmailAlreadyInUseException,
  UserNotFoundException,
} from '../../../common/exceptions/business.exceptions';

describe('UsersService (Integration with SQLite In-Memory)', () => {
  let service: UsersService;
  let moduleRef: TestingModule;

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

    service = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('deve cadastrar um novo usuário com sucesso e salvar senha hasheada', async () => {
    const email = 'integration@example.com';
    const user = await service.create({
      nome: 'John Doe',
      email,
      senha: 'mySecurePassword',
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.nome).toBe('John Doe');
    expect(user.email).toBe(email);
    expect(user.senha).not.toBe('mySecurePassword'); // Deve estar hasheada
    expect(user.reputacao).toBe(5.0);
    expect(user.hasMultasPendentes).toBe(false);
  });

  it('deve lançar EmailAlreadyInUseException ao tentar cadastrar e-mail duplicado', async () => {
    const email = 'duplicate@example.com';
    await service.create({
      nome: 'First',
      email,
      senha: 'password',
    });

    await expect(
      service.create({
        nome: 'Second',
        email,
        senha: 'password',
      }),
    ).rejects.toThrow(EmailAlreadyInUseException);
  });

  it('deve buscar um usuário existente pelo id', async () => {
    const email = 'findbyid@example.com';
    const created = await service.create({
      nome: 'Find Me',
      email,
      senha: 'password',
    });

    const found = await service.findById(created.id);
    expect(found).toBeDefined();
    expect(found.id).toBe(created.id);
    expect(found.nome).toBe('Find Me');
  });

  it('deve lançar UserNotFoundException ao buscar usuário inexistente', async () => {
    await expect(service.findById('non-existent-uuid')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('deve listar todos os usuários cadastrados', async () => {
    const listBefore = await service.findAll();
    const countBefore = listBefore.length;

    await service.create({
      nome: 'User List 1',
      email: 'list1@example.com',
      senha: 'password',
    });

    await service.create({
      nome: 'User List 2',
      email: 'list2@example.com',
      senha: 'password',
    });

    const listAfter = await service.findAll();
    expect(listAfter.length).toBe(countBefore + 2);
  });

  it('deve atualizar os dados do usuário com sucesso', async () => {
    const created = await service.create({
      nome: 'Original Name',
      email: 'original@example.com',
      senha: 'password',
    });

    const updated = await service.update(created.id, {
      nome: 'Updated Name',
      email: 'newemail@example.com',
    });

    expect(updated.nome).toBe('Updated Name');
    expect(updated.email).toBe('newemail@example.com');
  });

  it('deve lançar EmailAlreadyInUseException ao atualizar para e-mail pertencente a outro usuário', async () => {
    await service.create({
      nome: 'User A',
      email: 'usera@example.com',
      senha: 'password',
    });

    const userB = await service.create({
      nome: 'User B',
      email: 'userb@example.com',
      senha: 'password',
    });

    await expect(
      service.update(userB.id, {
        email: 'usera@example.com',
      }),
    ).rejects.toThrow(EmailAlreadyInUseException);
  });

  it('deve remover o usuário com sucesso', async () => {
    const created = await service.create({
      nome: 'Delete Me',
      email: 'delete@example.com',
      senha: 'password',
    });

    const removeRes = await service.remove(created.id);
    expect(removeRes.message).toContain('removido com sucesso');

    await expect(service.findById(created.id)).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('deve obter o perfil com acesso Total e limite de 3 livros se reputação for alta (5.0)', async () => {
    const created = await service.create({
      nome: 'Rep High',
      email: 'rephigh@example.com',
      senha: 'password',
    });

    const profile = await service.getProfile(created.id);
    expect(profile.limiteLivros).toBe('3 livros');
    expect(profile.acessoSistema).toBe('Total');
    expect(profile.statusMultas).toBe('REGULAR');
  });
});
