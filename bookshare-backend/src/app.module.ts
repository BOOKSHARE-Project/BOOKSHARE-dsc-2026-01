import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
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

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || '127.0.0.1',
        port: configService.get<number>('DB_PORT') ? Number(configService.get('DB_PORT')) : 5433,
        username: configService.get<string>('DB_USER') || 'mrn',
        password: configService.get<string>('DB_PASSWORD') || 'Ping2012',
        database: configService.get<string>('DB_DATABASE') || 'bookshare_db',
        entities: [UserEntity, BookEntity, LoanEntity],
        synchronize: true,
        dropSchema: false,
      }),
    }),

    UsersModule,
    BooksModule,
    LoansModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}