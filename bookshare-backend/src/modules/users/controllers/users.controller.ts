import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CreateUserResponseDto } from '../dto/create-user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = await this.usersService.create(dto);
    
    return {
      userId: user.id,
      nome: user.nome,
      email: user.email,
      reputacao: user.reputacao,
      message: 'Usuário criado com sucesso!'
    };
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }
}