import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoanEntity } from './entities/loan.entity';
import { LoansService } from './services/loans.service';
import { LoansController } from './controllers/loans.controller';
import { LoansTypeOrmRepository } from './repositories/loans-typeorm.repository';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';
import { LOANS_REPOSITORY } from './repositories/loans.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([LoanEntity]), UsersModule, BooksModule],
  controllers: [LoansController],
  providers: [
    LoansService,
    {
      provide: LOANS_REPOSITORY,
      useClass: LoansTypeOrmRepository,
    },
  ],
  exports: [LOANS_REPOSITORY, LoansService],
})
export class LoansModule {}
