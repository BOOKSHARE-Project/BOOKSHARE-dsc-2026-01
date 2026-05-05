import { Controller, Post, Body, Param } from '@nestjs/common';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post(':userId')
  async createLoan(
    @Param('userId') userId: string,
    @Body() dto: CreateLoanDto,
  ): Promise<LoanEntity> {
    return this.loansService.create(dto, userId);
  }
}