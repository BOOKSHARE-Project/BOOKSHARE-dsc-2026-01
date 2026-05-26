import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { BooksRepository, BOOKS_REPOSITORY } from '../repositories/books.repository.interface';
import { CreateBookDto } from '../dto/create-book.dto';
import { BookEntity } from '../entities/book.entity';
import { BookStatus } from 'src/common/enums/book-status.enum';

import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let repository: jest.Mocked<BooksRepository>;

  beforeEach(async () => {
    const repositoryMock: Partial<BooksRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: BOOKS_REPOSITORY,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    repository = module.get(BOOKS_REPOSITORY) as jest.Mocked<BooksRepository>;
  });

  describe('create', () => {
    it('should create a new book and return it', async () => {
      const dto: CreateBookDto = {
        titulo: 'Test Title',
        autor: 'Author Name',
        isbn: '1234567890',
        donoId: 'user-uuid',
      };

      const createdBook = new BookEntity();
      createdBook.id = 'uuid-123';
      createdBook.titulo = dto.titulo;
      createdBook.autor = dto.autor;
      createdBook.isbn = dto.isbn;
      createdBook.status = BookStatus.DISPONIVEL;
      createdBook.donoId = dto.donoId;
      createdBook.createdAt = new Date();
      createdBook.updatedAt = new Date();
      createdBook.deletedAt = null;

      repository.create.mockResolvedValue(createdBook);

      const result = await service.create(dto);
      expect(result).toBe(createdBook);
      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        titulo: dto.titulo,
        autor: dto.autor,
        isbn: dto.isbn,
        donoId: dto.donoId,
      }));
    });
  });

  describe('findById', () => {
    it('should return a book when found', async () => {
      const book = new BookEntity();
      book.id = 'uuid-123';
      book.titulo = 'Title';
      book.autor = 'Author';
      book.isbn = 'ISBN';
      book.status = BookStatus.DISPONIVEL;
      book.donoId = 'owner-id';
      book.createdAt = new Date();
      book.updatedAt = new Date();
      book.deletedAt = null;

      repository.findById.mockResolvedValue(book);
      const result = await service.findById('uuid-123');
      expect(result).toBe(book);
    });

    it('should throw NotFoundException when book does not exist', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('SUCCESS SCENARIO: should return the correct book when existing ID is provided', async () => {
      // Arrange
      const bookId = 'book-uuid-001';
      const expectedBook = new BookEntity();
      expectedBook.id = bookId;
      expectedBook.titulo = 'Clean Code';
      expectedBook.autor = 'Robert C. Martin';
      expectedBook.isbn = '978-0132350884';
      expectedBook.status = BookStatus.DISPONIVEL;
      expectedBook.donoId = 'owner-uuid-001';
      expectedBook.createdAt = new Date();
      expectedBook.updatedAt = new Date();
      expectedBook.deletedAt = null;

      repository.findById.mockResolvedValue(expectedBook);

      // Act
      const result = await service.findOne(bookId);

      // Assert
      expect(result).toEqual(expectedBook);
      expect(repository.findById).toHaveBeenCalledWith(bookId);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });

    it('FAILURE SCENARIO (404): should throw NotFoundException when non-existent ID is provided', async () => {
      // Arrange
      const nonExistentId = 'invalid-uuid';
      repository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(nonExistentId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(nonExistentId)).rejects.toThrow('Livro não encontrado.');
      expect(repository.findById).toHaveBeenCalledWith(nonExistentId);
    });
  });
});
