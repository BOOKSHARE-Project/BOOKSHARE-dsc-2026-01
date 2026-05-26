import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../repositories/books.repository.interface';
import { CreateBookDto } from '../dto/create-book.dto';
import { Book } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';

@Injectable()
export class BooksService {
  constructor(
    @Inject(BOOKS_REPOSITORY)
    private readonly booksRepository: BooksRepository,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const novoLivro = new Book(
      crypto.randomUUID(),
      dto.titulo,
      dto.autor,
      dto.isbn,
      BookStatus.DISPONIVEL,
      dto.donoId,
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

  async findOne(id: string): Promise<Book> {
    const book = await this.booksRepository.findById(id);

    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    return book;
  }

  async findAll(): Promise<Book[]> {
    return this.booksRepository.findAll();
  }
}
