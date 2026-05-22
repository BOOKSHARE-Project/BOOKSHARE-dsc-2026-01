import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UsersTypeOrmRepository } from './repositories/users-typeorm.repository';
import { USERS_REPOSITORY } from './repositories/users.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: USERS_REPOSITORY,
      useClass: UsersTypeOrmRepository,
    },
  ],
  exports: [USERS_REPOSITORY, UsersService],
})
export class UsersModule {}
