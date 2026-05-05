import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { LOANS_REPOSITORY, LoansRepository } from '../repositories/loans.repository.interface';
import { BOOKS_REPOSITORY, BooksRepository } from '../../books/repositories/books.repository.interface';
import { USERS_REPOSITORY, UsersRepository } from '../../users/repositories/users.repository.interface';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { BookStatus } from '../../../common/enums/book-status.enum';

@Injectable()
export class LoansService {
  constructor(
    @Inject(LOANS_REPOSITORY)
    private readonly loansRepository: LoansRepository,
    
    @Inject(BOOKS_REPOSITORY)
    private readonly booksRepository: BooksRepository,
    
    @Inject(USERS_REPOSITORY)
    private readonly usersRepository: UsersRepository,
  ) {}

  async create(dto: CreateLoanDto, userId: string): Promise<LoanEntity> {
    const user = await this.usersRepository.findByIdWithPendingFines(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (user.hasMultasPendentes) {
      throw new ForbiddenException('Usuário possui multas pendentes.');
    }

    if (user.reputacao < 4.0) {
      throw new ForbiddenException('Reputação insuficiente para realizar empréstimos.');
    }

    const activeLoansCount = await this.loansRepository.countActiveLoansByUser(userId);
    if (activeLoansCount >= 3) {
      throw new BadRequestException('Usuário já possui o limite de 3 empréstimos ativos.');
    }

    const book = await this.booksRepository.findById(dto.livroId);
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    if (book.status !== BookStatus.DISPONIVEL) {
      throw new BadRequestException('O livro não está disponível para empréstimo.');
    }

    if (book.donoId === userId) {
      throw new BadRequestException('Você não pode solicitar o empréstimo do seu próprio livro.');
    }

    const novoEmprestimo = {
      livroId: book.id,
      solicitanteId: userId,
      status: LoanStatus.PENDENTE,
      dataEmprestimo: new Date(),
    } as Partial<LoanEntity>;

    await this.booksRepository.updateStatus(book.id, BookStatus.EMPRESTADO);

    return this.loansRepository.save(novoEmprestimo);
  }
}