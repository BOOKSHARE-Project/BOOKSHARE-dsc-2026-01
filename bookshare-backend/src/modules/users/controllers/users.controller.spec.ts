/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../services/users.service';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserSelfGuard } from '../../auth/guards/user-self.guard';
import { JwtService } from '@nestjs/jwt';

describe('UsersController Guards', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const serviceMock: Partial<UsersService> = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: serviceMock },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should exist', () => {
    expect(controller).toBeDefined();
  });

  it('should not protect registration endpoint (create)', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.create,
    ) as unknown[] | undefined;
    expect(guards).toBeUndefined();
  });

  it('should protect findAll endpoint', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.findAll,
    ) as unknown[] | undefined;
    expect(guards).toContain(JwtAuthGuard);
  });

  it('should protect update endpoint with JwtAuthGuard and UserSelfGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.update,
    ) as unknown[] | undefined;
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(UserSelfGuard);
  });

  it('should protect remove endpoint with JwtAuthGuard and UserSelfGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.remove,
    ) as unknown[] | undefined;
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(UserSelfGuard);
  });

  it('should protect getProfile endpoint with JwtAuthGuard and UserSelfGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.getProfile,
    ) as unknown[] | undefined;
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(UserSelfGuard);
  });

  it('should protect findOne endpoint with JwtAuthGuard and UserSelfGuard', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      UsersController.prototype.findOne,
    ) as unknown[] | undefined;
    expect(guards).toContain(JwtAuthGuard);
    expect(guards).toContain(UserSelfGuard);
  });
});
