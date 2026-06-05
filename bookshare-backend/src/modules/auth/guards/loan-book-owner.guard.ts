import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Inject,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  LOANS_REPOSITORY,
  LoansRepository,
} from '../../loans/repositories/loans.repository.interface';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../../books/repositories/books.repository.interface';

interface RequestWithUser {
  user?: {
    sub: string;
  };
  params?: {
    id?: string;
  };
}

@Injectable()
export class LoanBookOwnerGuard implements CanActivate {
  constructor(
    @Inject(LOANS_REPOSITORY)
    private readonly loansRepository: LoansRepository,
    @Inject(BOOKS_REPOSITORY)
    private readonly booksRepository: BooksRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este recurso.',
      );
    }
    const loanId = request.params?.id;
    if (!loanId) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }
    const loan = await this.loansRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }
    const book = await this.booksRepository.findById(loan.bookId);
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }
    if (book.donoId !== user.sub) {
      throw new ForbiddenException('Usuário não é dono do livro.');
    }
    return true;
  }
}
