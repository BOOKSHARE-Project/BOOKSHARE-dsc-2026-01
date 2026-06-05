import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('UsersController Guards', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const serviceMock: Partial<UsersService> = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: serviceMock }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should not protect registration endpoint (create)', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.create);
    expect(guards).toBeUndefined();
  });

  it('should protect findAll endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.findAll);
    expect(guards).toContain(JwtAuthGuard);
  });

  it('should protect update endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.update);
    expect(guards).toContain(JwtAuthGuard);
  });

  it('should protect remove endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.remove);
    expect(guards).toContain(JwtAuthGuard);
  });

  it('should protect getProfile endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, controller.getProfile);
    expect(guards).toContain(JwtAuthGuard);
  });
});
