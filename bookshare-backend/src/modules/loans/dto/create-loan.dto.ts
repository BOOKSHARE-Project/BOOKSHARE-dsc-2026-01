import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateLoanDto {
  @IsNotEmpty({ message: 'O ID do livro é obrigatório' })
  @IsUUID('4', { message: 'O ID do livro deve ser un UUID válido' })
  livroId: string;
}