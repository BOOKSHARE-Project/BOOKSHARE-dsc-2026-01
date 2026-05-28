import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BooksRepository } from './books.repository.interface';
import { Book, BookEntity } from '../entities/book.entity';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { UpdateBookDto } from '../dto/update-book.dto';

@Injectable()
export class BooksTypeOrmRepository implements BooksRepository {
  constructor(
    @InjectRepository(BookEntity)
    private readonly typeOrmRepo: Repository<BookEntity>,
  ) {}

  async create(bookData: any): Promise<any> {
    const createdBook = this.typeOrmRepo.create(bookData);
    return await this.typeOrmRepo.save(createdBook);
  }

  async findById(id: string): Promise<any | null> {
    return await this.typeOrmRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<any[]> {
    return await this.typeOrmRepo.find();
  }

  async updateStatus(id: string, status: BookStatus): Promise<void> {
    await this.typeOrmRepo.update(id, { status });
  }

  async update(id: string, data: UpdateBookDto): Promise<Book> {
    await this.typeOrmRepo.update(id, data);
    
    return this.typeOrmRepo.findOne({ where: { id } });
  }

}
