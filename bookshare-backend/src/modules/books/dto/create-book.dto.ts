import { IsNotEmpty, IsString, IsISBN } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @IsString()
  titulo!: string;

  @IsNotEmpty({ message: 'O autor é obrigatório.' })
  @IsString()
  autor!: string;

  @IsNotEmpty({ message: 'O ISBN é obrigatório.' })
  @IsISBN(10, { message: 'Forneça um ISBN válido.' })
  isbn!: string;

  
  @IsNotEmpty({ message: 'O ID do dono é obrigatório.' })
  @IsString()
  donoId!: string; 
}