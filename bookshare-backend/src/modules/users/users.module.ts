import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersTypeOrmRepository } from './repositories/users-typeorm.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';
import { HASH_PROVIDER } from './providers/hash-provider.interface';
import { BCryptHashProvider } from './providers/bcrypt-hash-provider';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersTypeOrmRepository,
    },
    {
      provide: HASH_PROVIDER,
      useClass: BCryptHashProvider,
    },
  ],
  exports: [USERS_REPOSITORY, HASH_PROVIDER, UsersService],
})
export class UsersModule {}
