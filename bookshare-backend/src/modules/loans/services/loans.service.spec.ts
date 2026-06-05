import { Test, TestingModule } from '@nestjs/testing';
import { LoansService } from './loans.service';
import {
  LOANS_REPOSITORY,
  LoansRepository,
} from '../repositories/loans.repository.interface';
import {
  BOOKS_REPOSITORY,
  BooksRepository,
} from '../../books/repositories/books.repository.interface';
import {
  USERS_REPOSITORY,
  UsersRepository,
} from '../../users/repositories/users.repository.interface';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { LoanStatus } from '../../../common/enums/loan-status.enum';
import { BookStatus } from '../../../common/enums/book-status.enum';
import { BookEntity } from '../../books/entities/book.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('LoansService', () => {
  let service: LoansService;
  let loansRepo: jest.Mocked<LoansRepository>;
  let booksRepo: jest.Mocked<BooksRepository>;
  let usersRepo: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const loansMock: Partial<LoansRepository> = {
      findAll: jest.fn(),
      save: jest.fn(),
      countActiveLoansByUser: jest.fn(),
      updateStatus: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    const booksMock: Partial<BooksRepository> = {
      findById: jest.fn(),
      updateStatus: jest.fn(),
    };
    const usersMock: Partial<UsersRepository> = {
      findByIdWithPendingFines: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoansService,
        { provide: LOANS_REPOSITORY, useValue: loansMock },
        { provide: BOOKS_REPOSITORY, useValue: booksMock },
        { provide: USERS_REPOSITORY, useValue: usersMock },
      ],
    }).compile();

    service = module.get<LoansService>(LoansService);
    loansRepo = module.get(LOANS_REPOSITORY);
    booksRepo = module.get(BOOKS_REPOSITORY);
    usersRepo = module.get(USERS_REPOSITORY);
  });

  // ---------- findAll ----------
  describe('findAll', () => {
    it('should return all loans', async () => {
      const loanList: LoanEntity[] = [
        {
          id: 'l1',
          bookId: 'b1',
          requesterId: 'u1',
          status: LoanStatus.PENDENTE,
        } as LoanEntity,
        {
          id: 'l2',
          bookId: 'b2',
          requesterId: 'u2',
          status: LoanStatus.ATIVO,
        } as LoanEntity,
      ];
      loansRepo.findAll.mockResolvedValue(loanList);

      const result = await service.findAll();
      expect(result).toBe(loanList);
    });
  });

  // ---------- create (success) ----------
  describe('create', () => {
    const userId = 'user-123';
    const dto: CreateLoanDto = { livroId: 'book-456' };
    const user = {
      id: userId,
      hasMultasPendentes: false,
      reputacao: 4.5,
    } as any; // shape matches UsersRepository return
    const book: BookEntity = {
      id: 'book-456',
      titulo: 'Some Book',
      autor: 'Author',
      isbn: 'ISBN-001',
      status: BookStatus.DISPONIVEL,
      donoId: 'owner-999',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    const savedLoan: LoanEntity = {
      id: 'loan-789',
      bookId: book.id,
      requesterId: userId,
      status: LoanStatus.PENDENTE,
    } as LoanEntity;

    beforeEach(() => {
      usersRepo.findByIdWithPendingFines.mockResolvedValue(user);
      booksRepo.findById.mockResolvedValue(book);
      loansRepo.countActiveLoansByUser.mockResolvedValue(0);
      loansRepo.save.mockResolvedValue(savedLoan);
    });

    it('should create a loan when all validations pass', async () => {
      const result = await service.create(dto, userId);
      expect(result).toBe(savedLoan);
      expect(booksRepo.updateStatus).toHaveBeenCalledWith(
        book.id,
        BookStatus.EMPRESTADO,
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      usersRepo.findByIdWithPendingFines.mockResolvedValue(null);
      await expect(service.create(dto, userId)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user has pending fines', async () => {
      (usersRepo.findByIdWithPendingFines as jest.Mock).mockResolvedValue({
        ...user,
        hasMultasPendentes: true,
      });
      await expect(service.create(dto, userId)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if book is not available', async () => {
      booksRepo.findById.mockResolvedValue({
        ...book,
        status: BookStatus.EMPRESTADO,
      });
      await expect(service.create(dto, userId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('approveLoan', () => {
    const loanId = 'loan-123';
    const ownerId = 'owner-999';
    const loan = {
      id: loanId,
      bookId: 'book-456',
      requesterId: 'requester-111',
      status: LoanStatus.PENDENTE,
    } as any;
    const book = {
      id: 'book-456',
      status: BookStatus.DISPONIVEL,
      donoId: ownerId,
    } as any;

    beforeEach(() => {
      loansRepo.findById.mockResolvedValue(loan);
      booksRepo.findById.mockResolvedValue(book);
      loansRepo.update.mockResolvedValue({
        loanId,
        statusEmprestimo: LoanStatus.ATIVO,
        statusLivro: BookStatus.EMPRESTADO,
      } as any);
    });

    it('should approve a pending loan when user is the book owner', async () => {
      const result = await service.approveLoan(loanId, ownerId);
      expect(result).toEqual({
        loanId,
        statusEmprestimo: LoanStatus.ATIVO,
        statusLivro: BookStatus.EMPRESTADO,
      });
      expect(loansRepo.update).toHaveBeenCalledWith(
        loanId,
        expect.objectContaining({
          status: LoanStatus.ATIVO,
          dataRetornoPrevista: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException if loan does not exist', async () => {
      loansRepo.findById.mockResolvedValue(null);
      await expect(
        service.approveLoan('nonexistent', ownerId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException if loan is not pending', async () => {
      loansRepo.findById.mockResolvedValue({
        ...loan,
        status: LoanStatus.ATIVO,
      });
      await expect(service.approveLoan(loanId, ownerId)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if user is not the book owner', async () => {
      booksRepo.findById.mockResolvedValue({
        ...book,
        donoId: 'different-owner',
      });
      await expect(service.approveLoan(loanId, ownerId)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
