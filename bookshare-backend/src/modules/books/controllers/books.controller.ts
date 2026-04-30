import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';

@Controller('books') // Endpoint base: http://localhost:3000/books
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() dto: CreateBookDto) {
    const book = await this.booksService.create(dto);
    return {
      message: 'Livro cadastrado com sucesso',
      data: book,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const book = await this.booksService.findById(id);
    return { data: book };
  }
}