import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookEntity } from './entities/book.entity';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { BooksTypeOrmRepository } from './repositories/books-typeorm.repository';
import { BOOKS_REPOSITORY } from './repositories/books.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([BookEntity])],
  controllers: [BooksController],
  providers: [
    BooksService,
    {
      provide: BOOKS_REPOSITORY,
      useClass: BooksTypeOrmRepository,
    },
  ],
  exports: [BOOKS_REPOSITORY, BooksService],
})
export class BooksModule {}
