import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LoansRepository } from './loans.repository';
import { Loan, LoanEntity } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { BookEntity } from '../../books/entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { UserEntity } from '../../users/entities/user.entity';
import { UpdateLoanDto } from '../dto/update-loan.dto';

export class LoansTypeOrmRepository implements LoansRepository {
  constructor(
    @InjectRepository(LoanEntity)
    private readonly typeOrmRepo: Repository<LoanEntity>,
    private readonly dataSource: DataSource,
  ) {}
  findByIdWithBook(id: string): Promise<LoanEntity | null> {
    throw new Error('Method not implemented.');
  }

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

  async update(id: string, data: UpdateLoanDto): Promise<Loan> {
  await this.typeOrmRepo.update(id, data as any);
  return this.typeOrmRepo.findOne({ where: { id: id as any } });
}

  async registerReturnTransaction(
    loanId: string,
    bookId: string,
    userId?: string,
    newReputation?: number,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(LoanEntity, loanId, {
        status: LoanStatus.DEVOLVIDO,
      });
      await queryRunner.manager.update(BookEntity, bookId, {
        status: BookStatus.DISPONIVEL,
      });

      if (userId && newReputation !== undefined) {
        await queryRunner.manager.update(UserEntity, userId, {
          reputacao: newReputation,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
