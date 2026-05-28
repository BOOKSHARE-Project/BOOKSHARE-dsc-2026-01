import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Get,
  Put,
  Headers,
  Patch,
} from '@nestjs/common';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { UpdateLoanDto } from '../dto/update-loan.dto';

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

  @Put(':id/approve')
  async approveLoan(
    @Param('id') loanId: string,
    @Headers('authorization') authHeader: string,
  ) {
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';
    const userId = token;
    return this.loansService.approveLoan(loanId, userId);
  }

  @Put(':id/return')
  async returnLoan(
    @Param('id') loanId: string,
    @Headers('authorization') authHeader: string,
  ) {
    // Extrai o ID do usuário simulando o token JWT
    // (Como não há JwtAuthGuard configurado, extraímos o token manualmente do Header)
    const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

    // Na falta de um decode real, usamos o token como userId.
    // Em produção, isso viria de request.user populado por um Guard.
    const userId = token;

    // Repassa os dados para o Service, sem regra de negócio no Controller (Regra Estrita)
    return this.loansService.returnLoan(loanId, userId);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }
}
