import { Controller, Post, Body } from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }
}
