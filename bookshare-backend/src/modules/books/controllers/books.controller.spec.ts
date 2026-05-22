import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';

describe('BooksController', () => {
  let controller: BooksController;
  let service: jest.Mocked<BooksService>;

  beforeEach(async () => {
    const serviceMock: Partial<BooksService> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [{ provide: BooksService, useValue: serviceMock }],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get(BooksService) as jest.Mocked<BooksService>;
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
});
