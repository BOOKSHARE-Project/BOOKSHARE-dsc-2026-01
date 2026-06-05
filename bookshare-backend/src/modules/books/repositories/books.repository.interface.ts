import { Book, BookEntity } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { UpdateBookDto } from '../dto/update-book.dto';

export const BOOKS_REPOSITORY = 'BOOKS_REPOSITORY';

export interface BooksRepository {
  create(book: Partial<BookEntity>): Promise<BookEntity>;
  findById(id: string): Promise<BookEntity | null>;
  findAll(): Promise<BookEntity[]>;
  updateStatus(id: string, status: BookStatus): Promise<void>;
  update(id: string, data: UpdateBookDto): Promise<Book>;
  remove(book: BookEntity): Promise<void>;
}
