import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { LoanBookOwnerGuard } from './loan-book-owner.guard';
import { LoansRepository } from '../../loans/repositories/loans.repository.interface';
import { BooksRepository } from '../../books/repositories/books.repository.interface';

describe('LoanBookOwnerGuard', () => {
  let guard: LoanBookOwnerGuard;
  let loansRepository: jest.Mocked<LoansRepository>;
  let booksRepository: jest.Mocked<BooksRepository>;

  beforeEach(() => {
    loansRepository = {
      findById: jest.fn(),
    } as any;
    booksRepository = {
      findById: jest.fn(),
    } as any;
    guard = new LoanBookOwnerGuard(loansRepository, booksRepository);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when user sub matches the owner of the book associated with the loan', async () => {
    const loan = {
      id: 'loan-uuid-123',
      bookId: 'book-uuid-123',
    };
    const book = {
      id: 'book-uuid-123',
      donoId: 'user-uuid-123',
    };

    loansRepository.findById.mockResolvedValue(loan as any);
    booksRepository.findById.mockResolvedValue(book as any);

    const request = {
      params: {
        id: 'loan-uuid-123',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(loansRepository.findById).toHaveBeenCalledWith('loan-uuid-123');
    expect(booksRepository.findById).toHaveBeenCalledWith('book-uuid-123');
  });

  it('should throw ForbiddenException when user sub is not the owner of the book associated with the loan', async () => {
    const loan = {
      id: 'loan-uuid-123',
      bookId: 'book-uuid-123',
    };
    const book = {
      id: 'book-uuid-123',
      donoId: 'user-uuid-456',
    };

    loansRepository.findById.mockResolvedValue(loan as any);
    booksRepository.findById.mockResolvedValue(book as any);

    const request = {
      params: {
        id: 'loan-uuid-123',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new ForbiddenException('Usuário não é dono do livro.'),
    );
  });

  it('should throw NotFoundException when loan does not exist', async () => {
    loansRepository.findById.mockResolvedValue(null);

    const request = {
      params: {
        id: 'invalid-loan-uuid',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new NotFoundException('Empréstimo não encontrado.'),
    );
  });

  it('should throw NotFoundException when book does not exist', async () => {
    const loan = {
      id: 'loan-uuid-123',
      bookId: 'invalid-book-uuid',
    };
    loansRepository.findById.mockResolvedValue(loan as any);
    booksRepository.findById.mockResolvedValue(null);

    const request = {
      params: {
        id: 'loan-uuid-123',
      },
      user: {
        sub: 'user-uuid-123',
      },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(
      new NotFoundException('Livro não encontrado.'),
    );
  });
});
