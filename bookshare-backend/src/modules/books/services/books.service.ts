import { Injectable, NotFoundException } from '@nestjs/common';
import { BooksRepository } from '../repositories/books.repository';
import { CreateBookDto } from '../dto/create-book.dto';
import { Book } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';

@Injectable()
export class BooksService {
  constructor(private readonly booksRepository: BooksRepository) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const novoLivro = new Book(
      crypto.randomUUID(),
      dto.titulo,           
      dto.autor,
      dto.isbn,            
      BookStatus.DISPONIVEL, 
      dto.donoId             
    );

    return this.booksRepository.create(novoLivro); 
  }

  async findById(id: string): Promise<Book> {
    const book = await this.booksRepository.findById(id);
    
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }
    
    return book;
  }
}