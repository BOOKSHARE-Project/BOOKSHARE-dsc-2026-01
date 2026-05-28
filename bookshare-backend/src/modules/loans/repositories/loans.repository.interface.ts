import { LoanEntity, Loan } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { UpdateLoanDto } from '../dto/update-loan.dto';

export interface LoansRepository {
  findAll(): Promise<LoanEntity[]>;

  save(loanData: Partial<LoanEntity>): Promise<LoanEntity>;
  findById(id: string): Promise<LoanEntity | null>;
  countActiveLoansByUser(userId: string): Promise<number>;
  updateStatus(id: string, status: LoanStatus): Promise<void>;
  registerReturnTransaction(
    loanId: string,
    bookId: string,
    userId?: string,
    newReputation?: number,
  ): Promise<void>;
  update(id: string, data: UpdateLoanDto): Promise<Loan>;
  remove(loan: LoanEntity): Promise<void>;
}

export const LOANS_REPOSITORY = 'LoansRepository';
