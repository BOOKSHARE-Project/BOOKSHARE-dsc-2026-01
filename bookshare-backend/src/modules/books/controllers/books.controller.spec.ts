import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';

import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

import { JwtService } from '@nestjs/jwt';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

  beforeEach(async () => {
    const serviceMock: Partial<BooksService> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        { provide: BooksService, useValue: serviceMock },
        { provide: JwtService, useValue: {} },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get(BooksService);
  });

  describe('create', () => {
    it('should delegate to BooksService.create and return result', async () => {
      const dto: CreateBookDto = {
        titulo: 'Test Title',
        autor: 'Author',
        isbn: '123456',
        donoId: 'user-uuid',
      };
      const created = {} as any;
      service.create.mockResolvedValue(created);
      const result = await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, BooksController) as
        | unknown[]
        | undefined;
      expect(guards).toContain(JwtAuthGuard);
    });
  });
});
