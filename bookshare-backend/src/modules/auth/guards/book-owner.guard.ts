import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { BooksService } from '../../books/services/books.service';

@Injectable()
export class BookOwnerGuard implements CanActivate {
  constructor(private readonly booksService: BooksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // RED Phase skeleton: returns true so unauthorized tests fail
    return true;
  }
}
