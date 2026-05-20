import { LoanEntity } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';

export interface LoansRepository {
  findAll(): Promise<LoanEntity[]>;
  
  save(loanData: Partial<LoanEntity>): Promise<LoanEntity>;
  findById(id: string): Promise<LoanEntity | null>;
  countActiveLoansByUser(userId: string): Promise<number>;
  updateStatus(id: string, status: LoanStatus): Promise<void>;
  registerReturnTransaction(loanId: string, bookId: string, userId?: string, newReputation?: number): Promise<void>;
}

export const LOANS_REPOSITORY = 'LoansRepository';