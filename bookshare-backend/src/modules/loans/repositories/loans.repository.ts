import { Loan } from '../entities/loan.entity';

export abstract class LoansRepository {
  abstract countActiveLoansByUser(userId: string): Promise<number>;
  abstract save(loan: Loan): Promise<Loan>;
}