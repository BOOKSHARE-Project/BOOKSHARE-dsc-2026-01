import { CanActivate, ExecutionContext, Injectable, Inject } from '@nestjs/common';
import {
  LOANS_REPOSITORY,
  LoansRepository,
} from '../../loans/repositories/loans.repository.interface';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../../books/repositories/books.repository.interface';

@Injectable()
export class LoanBookOwnerGuard implements CanActivate {
  constructor(
    @Inject(LOANS_REPOSITORY)
    private readonly loansRepository: LoansRepository,
    @Inject(BOOKS_REPOSITORY)
    private readonly booksRepository: BooksRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // RED Phase skeleton: returns true so unauthorized tests fail
    return true;
  }
}
