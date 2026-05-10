import { Controller, Post, Body, Param, ParseUUIDPipe, Get } from '@nestjs/common';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post(':userId')
  async createLoan(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: CreateLoanDto,
  ): Promise<LoanEntity> {
    return this.loansService.create(dto, userId);
  }

  @Get()
async findAll(): Promise<LoanEntity[]> {
  return this.loansService.findAll();
}
}