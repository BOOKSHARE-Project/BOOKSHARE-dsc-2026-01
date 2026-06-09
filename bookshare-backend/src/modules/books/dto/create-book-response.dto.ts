import { BookStatus } from '../../../common/enums/book-status.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookResponseDto {
  @ApiProperty({
    description: 'ID do livro criado',
    example: 'c2f35d21-3b7c-4ee3-be12-2c8c4a45a331',
    required: true,
  })
  bookId!: string;

  @ApiProperty({
    description: 'Título do livro',
    example: 'O Senhor dos Anéis',
    required: true,
  })
  titulo!: string;

  @ApiProperty({
    description: 'Status atual do livro',
    enum: BookStatus,
    example: BookStatus.DISPONIVEL,
    required: true,
  })
  status!: BookStatus;

  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Livro cadastrado com sucesso!',
    required: true,
  })
  message!: string;
}

