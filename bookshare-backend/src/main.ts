import { Module } from '@nestjs/common';
import { LoansModule } from './modules/loans/loans.module';
import { BooksModule } from './modules/books/books.module';

@Module({
  imports: [
    BooksModule,
    LoansModule,
  ],
})
export class AppModule {}