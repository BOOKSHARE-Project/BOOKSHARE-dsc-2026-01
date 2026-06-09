import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'ID do usuário criado',
    example: 'd3b07384-d113-4ec5-a5d7-e2a222329384',
    required: true,
  })
  userId!: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: true,
  })
  nome!: string;

  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'joao.silva@example.com',
    required: true,
  })
  email!: string;

  @ApiProperty({
    description: 'Pontuação de reputação inicial do usuário',
    example: 5,
    required: true,
  })
  reputacao!: number;

  @ApiProperty({
    description: 'Mensagem de confirmação',
    example: 'Usuário cadastrado com sucesso!',
    required: true,
  })
  message!: string;
}

