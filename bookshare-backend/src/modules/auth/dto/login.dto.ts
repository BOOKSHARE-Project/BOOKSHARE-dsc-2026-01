import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'E-mail cadastrado do usuário',
    example: 'joao.silva@example.com',
    required: true,
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email!: string;

  @ApiProperty({
    description: 'Senha cadastrada do usuário',
    example: 'senhaSegura123',
    required: true,
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString({ message: 'A senha deve ser um texto' })
  senha!: string;
}
