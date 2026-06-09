import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoanDto {
  @ApiProperty({
    description: 'ID do livro a ser emprestado',
    example: 'c2f35d21-3b7c-4ee3-be12-2c8c4a45a331',
    required: true,
  })
  @IsNotEmpty({ message: 'O ID do livro é obrigatório' })
  @IsUUID('4', { message: 'O ID do livro deve ser un UUID válido' })
  livroId: string;
}

