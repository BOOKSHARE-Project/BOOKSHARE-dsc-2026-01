import { Book } from '../entities/book.entity';

export abstract class BooksRepository {
  abstract create(book: Book): Promise<Book>; 
  
  abstract findById(id: string): Promise<Book | null>;
  abstract updateStatus(id: string, status: string): Promise<void>;
}