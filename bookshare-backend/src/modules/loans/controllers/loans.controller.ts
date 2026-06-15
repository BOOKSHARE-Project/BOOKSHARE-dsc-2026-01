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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { UpdateLoanDto } from '../dto/update-loan.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { LoanBookOwnerGuard } from '../../auth/guards/loan-book-owner.guard';

@ApiTags('Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  @ApiOperation({ summary: 'Solicitar o empréstimo de um livro' })
  @ApiResponse({
    status: 201,
    description: 'Empréstimo solicitado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos (ex: ID de livro inválido).',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado.',
  })
  async createLoan(
    @CurrentUser() user: { sub: string },
    @Body() dto: CreateLoanDto,
  ): Promise<LoanEntity> {
    return this.loansService.create(dto, user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os empréstimos registrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empréstimos retornada com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  async findAll(): Promise<LoanEntity[]> {
    return this.loansService.findAll();
  }

  @Put(':id/approve')
  @UseGuards(LoanBookOwnerGuard)
  @ApiOperation({ summary: 'Aprovar uma solicitação de empréstimo' })
  @ApiResponse({
    status: 200,
    description: 'Empréstimo aprovado com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Apenas o dono do livro solicitado pode aprovar o empréstimo.',
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo ou livro não encontrado.',
  })
  async approveLoan(
    @Param('id') loanId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.loansService.approveLoan(loanId, user.sub);
  }

  @Put(':id/return')
  @UseGuards(LoanBookOwnerGuard)
  @ApiOperation({ summary: 'Confirmar a devolução de um livro emprestado' })
  @ApiResponse({
    status: 200,
    description: 'Devolução de empréstimo confirmada com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Acesso proibido. Apenas o dono do livro pode registrar a devolução.',
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo ou livro não encontrado.',
  })
  async returnLoan(
    @Param('id') loanId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.loansService.returnLoan(loanId, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações de um empréstimo' })
  @ApiResponse({
    status: 200,
    description: 'Empréstimo atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Empréstimo não encontrado.',
  })
  async update(@Param('id') id: string, @Body() updateLoanDto: UpdateLoanDto) {
    return this.loansService.update(id, updateLoanDto);
  }
}
