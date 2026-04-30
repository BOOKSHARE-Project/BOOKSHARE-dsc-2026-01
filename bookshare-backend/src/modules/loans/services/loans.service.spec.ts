import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { LoansRepository } from '../repositories/loans.repository';
import { BooksRepository } from '../../books/repositories/books.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('LoansService', () => {
  let service: LoansService;
  let loansRepository: LoansRepository;
  let booksRepository: BooksRepository;
  let usersRepository: UsersRepository;

  // Criamos versões "falsas" (mocks) dos repositórios
  const mockLoansRepository = {
    save: jest.fn(),
    countActiveLoansByUser: jest.fn(),
  };
  const mockBooksRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };
  const mockUsersRepository = {
    findByIdWithPendingFines: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: LoansRepository, useValue: mockLoansRepository },
        { provide: BooksRepository, useValue: mockBooksRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    loansRepository = module.get<LoansRepository>(LoansRepository);
    booksRepository = module.get<BooksRepository>(BooksRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um empréstimo com sucesso', async () => {
      // Configuração do Mock (Cenário Perfeito)
      const mockUser = { id: 'user-1', hasMultasPendentes: false, reputacao: 5.0 };
      const mockBook = { id: 'book-1', status: BookStatus.DISPONIVEL, donoId: 'outro-user' };
      
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue(mockUser);
      mockLoansRepository.countActiveLoansByUser.mockResolvedValue(1);
      mockBooksRepository.findById.mockResolvedValue(mockBook);
      mockLoansRepository.save.mockImplementation((loan) => Promise.resolve(loan));

      const result = await service.create({ livroId: 'book-1' }, 'user-1');

      expect(result).toBeDefined();
      expect(result.status).toBe(LoanStatus.PENDENTE);
      expect(mockBooksRepository.updateStatus).toHaveBeenCalledWith('book-1', BookStatus.EMPRESTADO);
    });

    it('deve lançar erro se o utilizador tiver multas pendentes', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({
        id: 'user-1',
        hasMultasPendentes: true,
      });

      await expect(service.create({ livroId: 'book-1' }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('deve lançar erro se o utilizador tentar levantar o próprio livro', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({
        id: 'user-1',
        hasMultasPendentes: false,
        reputacao: 5.0
      });
      mockBooksRepository.findById.mockResolvedValue({
        id: 'book-1',
        status: BookStatus.DISPONIVEL,
        donoId: 'user-1' // Mesmo ID do solicitante
      });

      await expect(service.create({ livroId: 'book-1' }, 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    it('deve lançar erro se o utilizador já tiver 3 empréstimos ativos', async () => {
        mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({
          id: 'user-1',
          hasMultasPendentes: false,
          reputacao: 5.0
        });
        mockLoansRepository.countActiveLoansByUser.mockResolvedValue(3); // Limite atingido
  
        await expect(service.create({ livroId: 'book-1' }, 'user-1'))
          .rejects.toThrow(BadRequestException);
      });
  });
});