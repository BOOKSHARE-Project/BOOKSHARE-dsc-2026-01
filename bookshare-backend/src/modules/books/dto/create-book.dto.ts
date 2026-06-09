import { IsNotEmpty, IsString, IsISBN } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({
    description: 'Título do livro',
    example: 'O Senhor dos Anéis',
    required: true,
  })
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @IsString()
  titulo!: string;

  @ApiProperty({
    description: 'Autor do livro',
    example: 'J.R.R. Tolkien',
    required: true,
  })
  @IsNotEmpty({ message: 'O autor é obrigatório.' })
  @IsString()
  autor!: string;

  @ApiProperty({
    description: 'Código ISBN do livro',
    example: '978-8578270698',
    required: true,
  })
  @IsString({ message: 'O ISBN deve ser um texto' })
  @IsNotEmpty({ message: 'O ISBN é obrigatório' })
  isbn: string;

  @ApiProperty({
    description: 'ID do usuário que é dono do livro',
    example: 'd3b07384-d113-4ec5-a5d7-e2a222329384',
    required: true,
  })
  @IsNotEmpty({ message: 'O ID do dono é obrigatório.' })
  @IsString()
  donoId!: string;
}

