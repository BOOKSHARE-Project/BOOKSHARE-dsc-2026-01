import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import {
  LOANS_REPOSITORY,
  LoansRepository,
} from '../repositories/loans.repository.interface';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../../books/repositories/books.repository.interface';
import {
  USERS_REPOSITORY,
  UsersRepository,
} from '../../users/repositories/users.repository.interface';
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

  async findAll(): Promise<LoanEntity[]> {
    return this.loansRepository.findAll();
  }

  async create(dto: CreateLoanDto, userId: string): Promise<LoanEntity> {
    // 1. Validação do Usuário
    const user = await this.usersRepository.findByIdWithPendingFines(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    // 2. Validação de Regras de Negócio do Usuário
    if (user.hasMultasPendentes) {
      throw new ForbiddenException('Usuário possui multas pendentes.');
    }

    if (user.reputacao < 4.0) {
      throw new ForbiddenException(
        'Reputação insuficiente para realizar empréstimos.',
      );
    }

    // 3. Validação de Limite de Empréstimos Ativos
    const activeLoansCount =
      await this.loansRepository.countActiveLoansByUser(userId);
    if (activeLoansCount >= 3) {
      throw new BadRequestException(
        'Usuário já possui o limite de 3 empréstimos ativos.',
      );
    }

    // 4. Validação do Livro
    const book = await this.booksRepository.findById(dto.livroId);
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    // 5. Validação de Status do Livro
    if (book.status !== BookStatus.DISPONIVEL) {
      throw new BadRequestException(
        'O livro não está disponível para empréstimo.',
      );
    }

    // 6. Impedir que o dono pegue o próprio livro
    if (book.donoId === userId) {
      throw new BadRequestException(
        'Você não pode solicitar o empréstimo do seu próprio livro.',
      );
    }

    // 7. Preparação dos dados para salvar
    const loanData: Partial<LoanEntity> = {
      bookId: book.id,
      requesterId: userId,
      status: LoanStatus.PENDENTE,
      // Se quiser data de retorno: dataRetornoPrevista: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    // 8. Atualizar status do livro para EMPRESTADO
    await this.booksRepository.updateStatus(book.id, BookStatus.EMPRESTADO);

    // 9. Salvar e retornar o empréstimo criado
    return this.loansRepository.save(loanData);
  }

  async returnLoan(loanId: string, userId: string) {
    // 1. Validar se o empréstimo existe
    const loan = await this.loansRepository.findById(loanId);
    if (!loan) {
      throw new NotFoundException('Empréstimo não encontrado.');
    }

    // 2. Validar se o empréstimo está ATIVO
    if (loan.status !== LoanStatus.ATIVO) {
      throw new BadRequestException(
        'O empréstimo não está ativo para ser devolvido.',
      );
    }

    // 3. Validar se o userId é o dono do livro (RN02)
    const book = await this.booksRepository.findById(loan.bookId);
    if (!book) {
      throw new NotFoundException('Livro não encontrado.');
    }

    if (book.donoId !== userId) {
      throw new ForbiddenException('Usuário não é dono do livro.');
    }

    // 4. Lógica de atraso (RN05 e RN06)
    let newReputation: number | undefined = undefined;

    if (loan.dataRetornoPrevista) {
      const currentDate = new Date();
      if (currentDate > loan.dataRetornoPrevista) {
        const MILLISECONDS_IN_A_DAY = 1000 * 60 * 60 * 24;
        const delayInMilliseconds =
          currentDate.getTime() - loan.dataRetornoPrevista.getTime();
        const daysDelayed = Math.ceil(
          delayInMilliseconds / MILLISECONDS_IN_A_DAY,
        );

        if (daysDelayed > 0) {
          const borrower = await this.usersRepository.findById(
            loan.requesterId,
          );
          if (borrower) {
            newReputation = borrower.reputacao - 0.5 * daysDelayed;
            // Evitar pontuação negativa
            if (newReputation < 0) newReputation = 0;
          }
        }
      }
    }

    // 5. Chamar a transação atômica do repositório
    await this.loansRepository.registerReturnTransaction(
      loan.id,
      book.id,
      loan.requesterId,
      newReputation,
    );

    // 6. Retornar dados atualizados (sem depender de HTTP)
    return {
      loanId: loan.id,
      statusEmprestimo: LoanStatus.DEVOLVIDO,
      statusLivro: BookStatus.DISPONIVEL,
      reputacaoAtualizada: newReputation,
    };
  }
}
