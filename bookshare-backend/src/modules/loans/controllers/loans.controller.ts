import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { UpdateLoanDto } from '../dto/update-loan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async createLoan(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateLoanDto,
  ): Promise<LoanEntity> {
    return this.loansService.create(dto, user.sub);
  }

  @Get()
  async findAll(): Promise<LoanEntity[]> {
    return this.loansService.findAll();
  }

  @Put(':id/approve')
  async approveLoan(
    @Param('id') loanId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.loansService.approveLoan(loanId, user.sub);
  }

  @Put(':id/return')
  async returnLoan(
    @Param('id') loanId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.loansService.returnLoan(loanId, user.sub);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }
}
