import { PartialType } from '@nestjs/mapped-types';
import { CreateLoanDto } from './create-loan.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLoanDto extends PartialType(CreateLoanDto) {

  @IsOptional()
  @IsString()
  status?: string;
}