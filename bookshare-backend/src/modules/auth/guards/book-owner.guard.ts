import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BooksService } from '../../books/services/books.service';

interface RequestWithUser {
  user?: {
    sub: string;
  };
  params?: {
    id?: string;
  };
}

@Injectable()
export class BookOwnerGuard implements CanActivate {
  constructor(private readonly booksService: BooksService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException(
        'Acesso negado: você não tem permissão para acessar este recurso.',
      );
    }
    const bookId = request.params?.id;
    if (!bookId) {
      throw new NotFoundException('Livro não encontrado.');
    }
    const book = await this.booksService.findOne(bookId);
    if (book.donoId !== user.sub) {
      throw new ForbiddenException(
        'Acesso negado: você não é o dono deste livro.',
      );
    }
    return true;
  }
}
