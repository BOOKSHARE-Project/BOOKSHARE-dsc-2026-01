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

  async findAll(): Promise<LoanEntity[]> {
  return await this.typeOrmRepo.find();
  }

  async save(loanData: Partial<LoanEntity>): Promise<LoanEntity> {
    const loan = this.typeOrmRepo.create(loanData);
    return await this.typeOrmRepo.save(loan);
  }

  async findById(id: string): Promise<LoanEntity | null> {
    return await this.typeOrmRepo.findOne({ where: { id: id } });
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