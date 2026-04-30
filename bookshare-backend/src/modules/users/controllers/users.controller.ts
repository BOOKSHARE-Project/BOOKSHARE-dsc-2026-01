import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return {
      message: 'Usuário criado com sucesso',
      data: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        reputacao: user.reputacao
      }
    };
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { data: user };
  }
}