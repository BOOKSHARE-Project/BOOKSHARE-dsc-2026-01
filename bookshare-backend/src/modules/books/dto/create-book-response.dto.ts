import { BookStatus } from '../../../common/enums/book-status.enum';

export class CreateBookResponseDto {
  bookId!: string;
  titulo!: string;
  status!: BookStatus;
  message!: string;
}