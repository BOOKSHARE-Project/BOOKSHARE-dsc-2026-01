import { BookEntity } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';

export const BOOKS_REPOSITORY = 'BOOKS_REPOSITORY';

export interface BooksRepository {
  create(book: Partial<BookEntity>): Promise<BookEntity>;
  findById(id: string): Promise<BookEntity | null>;
  updateStatus(id: string, status: BookStatus): Promise<void>;
}
