import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BookOwnerGuard } from './book-owner.guard';
import { BooksService } from '../../books/services/books.service';

describe('BookOwnerGuard', () => {
  let guard: BookOwnerGuard;
  let booksService: jest.Mocked<BooksService>;

  beforeEach(() => {
    booksService = {
      findOne: jest.fn(),
    } as any;
    guard = new BookOwnerGuard(booksService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when user sub matches book donoId', async () => {
    const book = {
      id: 'book-uuid-123',
      donoId: 'user-uuid-123',
    };
    booksService.findOne.mockResolvedValue(book as any);

    const request = {
      params: {
        id: 'book-uuid-123',
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
    expect(booksService.findOne).toHaveBeenCalledWith('book-uuid-123');
  });

  it('should throw ForbiddenException when user sub does not match book donoId', async () => {
    const book = {
      id: 'book-uuid-123',
      donoId: 'user-uuid-456',
    };
    booksService.findOne.mockResolvedValue(book as any);

    const request = {
      params: {
        id: 'book-uuid-123',
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
      new ForbiddenException('Acesso negado: você não é o dono deste livro.'),
    );
  });

  it('should throw NotFoundException when book does not exist', async () => {
    booksService.findOne.mockRejectedValue(
      new NotFoundException('Livro não encontrado.'),
    );

    const request = {
      params: {
        id: 'invalid-book-uuid',
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
