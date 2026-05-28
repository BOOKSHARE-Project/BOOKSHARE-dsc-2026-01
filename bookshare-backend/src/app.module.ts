import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './modules/users/entities/user.entity';
import { BookEntity } from './modules/books/entities/book.entity';
import { LoanEntity } from './modules/loans/entities/loan.entity';
import { UsersModule } from './modules/users/users.module';
import { BooksModule } from './modules/books/books.module';
import { LoansModule } from './modules/loans/loans.module';

import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '127.0.0.1',
      port: 5433,
      username: 'mrn',
      password: 'Ping2012',
      database: 'bookshare_db',
      entities: [UserEntity, BookEntity, LoanEntity],
      synchronize: true,
      dropSchema: false,
    }),

    UsersModule,
    BooksModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}