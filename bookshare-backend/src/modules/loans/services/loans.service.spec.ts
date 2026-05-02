import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import { LoansRepository } from '../repositories/loans.repository';
import { BooksRepository } from '../../books/repositories/books.repository';
import { UsersRepository } from '../../users/repositories/users.repository';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('LoansService', () => {
  let service: LoansService;
  
  const mockLoansRepository = { save: jest.fn(), countActiveLoansByUser: jest.fn() };
  const mockBooksRepository = { findById: jest.fn(), updateStatus: jest.fn() };
  const mockUsersRepository = { findByIdWithPendingFines: jest.fn() };

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
    
    jest.clearAllMocks();
  });

  describe('Use Case: Solicitar Empréstimo (Create)', () => {
    
    it('Deve criar um empréstimo com sucesso e mudar o status do livro', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({ id: 'user-1', hasMultasPendentes: false, reputacao: 5.0 });
      mockLoansRepository.countActiveLoansByUser.mockResolvedValue(1);
      mockBooksRepository.findById.mockResolvedValue({ id: 'book-1', status: BookStatus.DISPONIVEL, donoId: 'user-2' });
      mockLoansRepository.save.mockImplementation(loan => Promise.resolve({ ...loan, id: 'loan-123' }));

      const result = await service.create({ livroId: 'book-1' }, 'user-1');

      expect(result).toBeDefined();
      expect(result.status).toBe(LoanStatus.PENDENTE);
      expect(mockBooksRepository.updateStatus).toHaveBeenCalledWith('book-1', BookStatus.EMPRESTADO); 
    });

    // --- 🟡 REGRAS DE NEGÓCIO ---
    it('Deve falhar se o usuário não for encontrado (Vulnerabilidade de ID falso)', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue(null);

      await expect(service.create({ livroId: 'book-1' }, 'user-fantasma'))
        .rejects.toThrow(NotFoundException);
    });

    it('Deve falhar se a reputação do usuário for menor que 4.0', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({ id: 'user-1', hasMultasPendentes: false, reputacao: 3.9 });

      await expect(service.create({ livroId: 'book-1' }, 'user-1'))
        .rejects.toThrow(ForbiddenException);
    });

    it('Deve falhar se o livro já estiver emprestado ou indisponível', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({ id: 'user-1', hasMultasPendentes: false, reputacao: 5.0 });
      mockLoansRepository.countActiveLoansByUser.mockResolvedValue(0);
      mockBooksRepository.findById.mockResolvedValue({ id: 'book-1', status: BookStatus.EMPRESTADO, donoId: 'user-2' });

      await expect(service.create({ livroId: 'book-1' }, 'user-1'))
        .rejects.toThrow(BadRequestException);
    });

    // --- 🔴 VULNERABILIDADES EXTREMAS ---
    it('Deve falhar se o sistema tentar salvar o empréstimo, mas o banco de dados cair no meio do processo', async () => {
      mockUsersRepository.findByIdWithPendingFines.mockResolvedValue({ id: 'user-1', hasMultasPendentes: false, reputacao: 5.0 });
      mockLoansRepository.countActiveLoansByUser.mockResolvedValue(0);
      mockBooksRepository.findById.mockResolvedValue({ id: 'book-1', status: BookStatus.DISPONIVEL, donoId: 'user-2' });
      
      mockLoansRepository.save.mockRejectedValue(new Error('Database Connection Lost'));

      await expect(service.create({ livroId: 'book-1' }, 'user-1'))
        .rejects.toThrow('Database Connection Lost');
      
    });
  });
});