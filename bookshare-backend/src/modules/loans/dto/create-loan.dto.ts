import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLoanDto {
  @IsNotEmpty({ message: 'O ID do livro (livroId) é obrigatório.' })
  @IsUUID('4', { message: 'O ID do livro deve ser um UUID válido.' })
  livroId!: string;
}