import {
  Controller,
  Post,
  Body,
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
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BookOwnerGuard } from '../../auth/guards/book-owner.guard';

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os livros cadastrados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de livros retornada com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  async findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter dados de um livro pelo ID' })
  @ApiResponse({
    status: 200,
    description: 'Dados do livro retornados com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado.',
  })
  async findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cadastrar um novo livro' })
  @ApiResponse({
    status: 201,
    description: 'Livro cadastrado com sucesso.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de requisição inválidos.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  async create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @UseGuards(BookOwnerGuard)
  @ApiOperation({ summary: 'Atualizar informações de um livro existente' })
  @ApiResponse({
    status: 200,
    description: 'Livro atualizado com sucesso.',
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
    description:
      'Acesso proibido. Apenas o dono do livro pode modificar seus dados.',
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado.',
  })
  async update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @UseGuards(BookOwnerGuard)
  @ApiOperation({ summary: 'Remover um livro do sistema' })
  @ApiResponse({
    status: 200,
    description: 'Livro removido com sucesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Acesso não autorizado.',
  })
  @ApiResponse({
    status: 403,
    description: 'Acesso proibido. Apenas o dono do livro pode removê-lo.',
  })
  @ApiResponse({
    status: 404,
    description: 'Livro não encontrado.',
  })
  async remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
