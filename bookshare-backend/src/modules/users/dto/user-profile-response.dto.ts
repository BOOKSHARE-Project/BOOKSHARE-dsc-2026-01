import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 'd3b07384-d113-4ec5-a5d7-e2a222329384',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    required: true,
  })
  nome: string;

  @ApiProperty({
    description: 'Endereço de e-mail do usuário',
    example: 'joao.silva@example.com',
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'Pontuação de reputação do usuário',
    example: 4.8,
    required: true,
  })
  reputacao: number;

  @ApiProperty({
    description: 'Limite de livros que o usuário pode pegar emprestado',
    example: 'Até 5 livros',
    required: true,
  })
  limiteLivros: string;

  @ApiProperty({
    description: 'Status de acesso do usuário ao sistema',
    example: 'Ativo',
    required: true,
  })
  acessoSistema: string;

  @ApiProperty({
    description: 'Status de multas pendentes',
    example: 'Nenhuma pendência',
    required: true,
  })
  statusMultas: string;
}
