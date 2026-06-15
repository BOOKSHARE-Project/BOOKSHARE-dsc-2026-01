import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';
import { IsOptional, IsString, IsDate } from 'class-validator';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiProperty({
    description: 'Novo status do empréstimo',
    example: 'Devolvido',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O status deve ser uma string' })
  status?: string;

  @IsOptional()
  @IsDate({ message: 'A data de retorno prevista deve ser uma data válida' })
  dataRetornoPrevista?: Date;
}
