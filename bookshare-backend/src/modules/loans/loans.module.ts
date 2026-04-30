import { Module } from '@nestjs/common';
import { LoansController } from './controllers/loans.controllers';
import { LoansService } from './services/loans.service';
import { BooksModule } from '../books/books.module'; // Importação essencial
import { UsersRepository } from '../users/repositories/users.repository';
import { LoansRepository } from './repositories/loans.repository';

@Module({
  imports: [
    BooksModule,
  ],
  controllers: [LoansController],
  providers: [
    LoansService,
    {
      provide: UsersRepository,
      
      useClass: class PlaceholderUsersRepository {} as any,
    },
    {
      provide: LoansRepository,
      useClass: class PlaceholderLoansRepository {} as any,
    },
  ],
})
export class LoansModule {}