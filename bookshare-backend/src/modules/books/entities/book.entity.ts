import { BookStatus } from '../../../common/enums/book-status.enum';

export class Book {
  constructor(
    public id: string,
    public titulo: string,
    public autor: string,
    public isbn: string,
    public status: BookStatus,
    public donoId: string,
  ) {}
}