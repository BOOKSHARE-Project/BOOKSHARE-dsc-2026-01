import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'O email deve ser válido' })
  email!: string;

  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  senha!: string;
}
