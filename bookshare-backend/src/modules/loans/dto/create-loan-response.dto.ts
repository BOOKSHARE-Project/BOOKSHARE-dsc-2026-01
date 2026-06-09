import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanResponseDto {
  @ApiProperty({
    description: 'ID do empréstimo solicitado',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    required: true,
  })
  loanId!: string;

  @ApiProperty({
    description: 'ID do livro associado ao empréstimo',
    example: 'c2f35d21-3b7c-4ee3-be12-2c8c4a45a331',
    required: true,
  })
  livroId!: string;

  @ApiProperty({
    description: 'Status atual da solicitação de empréstimo',
    enum: LoanStatus,
    example: LoanStatus.PENDENTE,
    required: true,
  })
  status!: LoanStatus;

  @ApiProperty({
    description: 'Data de solicitação do empréstimo',
    example: '2026-06-09T11:27:00.000Z',
    required: true,
  })
  dataSolicitacao!: Date;

  @ApiProperty({
    description: 'Mensagem de confirmação ou erro explicativa',
    example: 'Empréstimo solicitado com sucesso!',
    required: true,
  })
  message!: string;
}

