import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../repositories/books.repository.interface';
import { CreateBookDto } from '../dto/create-book.dto';
import { Book } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { UpdateBookDto } from '../dto/update-book.dto';

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

  async update(id: string, data: UpdateBookDto): Promise<Book> {
    const bookExists = await this.booksRepository.findById(id);
    if (!bookExists) {
      throw new NotFoundException('Livro não encontrado.');
    }

    return this.booksRepository.update(id, data);
  }

  async remove(id: string) {
    const book = await this.booksRepository.findById(id);
    
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    await this.booksRepository.remove(book);

    return {
      message: 'Livro removido com sucesso.',
    };
  }
}


