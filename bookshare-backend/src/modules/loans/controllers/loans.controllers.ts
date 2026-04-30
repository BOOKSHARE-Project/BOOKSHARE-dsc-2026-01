import { Controller, Post, Body } from '@nestjs/common';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { CreateLoanResponseDto } from '../dto/create-loan-response.dto';

@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  async create(@Body() dto: CreateLoanDto): Promise<CreateLoanResponseDto> {
    const userId = 'id-do-usuario-logado'; // Simulação por enquanto
    const loan = await this.loansService.create(dto, userId);

    // Retornamos exatamente o formato do DTO de Resposta
    return {
      loanId: loan.id,
      livroId: loan.livroId,
      status: loan.status,
      dataSolicitacao: loan.dataSolicitacao,
      message: 'Solicitação de empréstimo realizada com sucesso!'
    };
  }
}