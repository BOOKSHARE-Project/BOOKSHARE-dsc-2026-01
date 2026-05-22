import { IsNotEmpty, IsString, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @IsString()
  titulo!: string;

  @IsNotEmpty({ message: 'O autor é obrigatório.' })
  @IsString()
  autor!: string;

  @IsString({ message: 'O ISBN deve ser um texto' })
  @IsNotEmpty({ message: 'O ISBN é obrigatório' })
  isbn: string;

  @IsNotEmpty({ message: 'O ID do dono é obrigatório.' })
  @IsString()
  donoId!: string;
}
