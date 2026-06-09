import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateLoanDto } from './create-loan.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @ApiProperty({
    description: 'Novo status do empréstimo',
    example: 'Devolvido',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}

