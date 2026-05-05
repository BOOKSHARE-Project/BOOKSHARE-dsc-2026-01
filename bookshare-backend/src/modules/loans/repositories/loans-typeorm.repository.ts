import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoansRepository } from './loans.repository';
import { LoanEntity } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';

@Injectable()
export class LoansTypeOrmRepository implements LoansRepository {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly typeOrmRepo: Repository<LoanEntity>,
  ) {}

  async save(loanData: any): Promise<any> {
    const loan = this.typeOrmRepo.create(loanData);
    return await this.typeOrmRepo.save(loan);
  }

  async findById(id: string): Promise<any | null> {
    return await this.typeOrmRepo.findOne({ where: { loanId: id } });
  }

  async countActiveLoansByUser(userId: string): Promise<number> {
    return await this.typeOrmRepo.count({
      where: {
        requesterId: userId,
        status: LoanStatus.PENDENTE,
      },
    });
  }

  async updateStatus(id: string, status: LoanStatus): Promise<void> {
    await this.typeOrmRepo.update(id, { status });
  }
}