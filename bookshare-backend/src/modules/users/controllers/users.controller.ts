import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserProfileResponseDto } from '../dto/user-profile-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserSelfGuard } from '../../auth/guards/user-self.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários cadastrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado. Token JWT inválido ou ausente.',
  })
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito. E-mail já cadastrado no sistema.',
  })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserSelfGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar informações de um usuário existente' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido. Apenas o próprio usuário pode modificar seus dados.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito. O novo e-mail já está em uso por outro usuário.',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserSelfGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido. Apenas o próprio usuário pode remover sua conta.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserSelfGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obter dados de um usuário pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário retornados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido. Apenas o próprio usuário pode acessar seus dados.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, UserSelfGuard)
  @Get(':id/profile')
  @ApiOperation({ summary: 'Obter o perfil público/detalhado do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário retornado com sucesso.',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido. Apenas o próprio usuário pode acessar seu perfil.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado.',
  })
  async getProfile(@Param('id') id: string): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(id);
  }
}

