import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { CreateBookResponseDto } from '../dto/create-book-response.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  async create(@Body() dto: CreateBookDto): Promise<CreateBookResponseDto> {
    const book = await this.booksService.create(dto);
    
    return {
      bookId: book.id,
      titulo: book.titulo,
      status: book.status,
      message: 'Livro cadastrado com sucesso!'
    };
  }

  @Get(':id')
  async getBook(@Param('id') id: string) {
    const book = await this.booksService.findById(id);
    return { data: book };
  }
}