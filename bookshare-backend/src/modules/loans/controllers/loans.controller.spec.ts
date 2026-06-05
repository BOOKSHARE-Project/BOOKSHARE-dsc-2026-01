/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { LoansController } from './loans.controller';
import { LoansService } from '../services/loans.service';
import { CreateLoanDto } from '../dto/create-loan.dto';
import { LoanEntity } from '../entities/loan.entity';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LoanBookOwnerGuard } from '../../auth/guards/loan-book-owner.guard';
import { LOANS_REPOSITORY } from '../repositories/loans.repository.interface';
import { BOOKS_REPOSITORY } from '../../books/repositories/books.repository.interface';

import { JwtService } from '@nestjs/jwt';

describe('LoansController', () => {
  let controller: LoansController;
  let service: jest.Mocked<LoansService>;

  beforeEach(async () => {
    const serviceMock: Partial<LoansService> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoansController],
      providers: [
        { provide: LoansService, useValue: serviceMock },
        { provide: JwtService, useValue: {} },
        { provide: LOANS_REPOSITORY, useValue: {} },
        { provide: BOOKS_REPOSITORY, useValue: {} },
      ],
    }).compile();

    controller = module.get<LoansController>(LoansController);
    service = module.get(LoansService);
  });

  describe('guards', () => {
    it('should be protected by JwtAuthGuard at class level', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, LoansController) as
        | unknown[]
        | undefined;
      expect(guards).toContain(JwtAuthGuard);
    });

    it('should protect approveLoan endpoint with LoanBookOwnerGuard', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LoansController.prototype.approveLoan,
      ) as unknown[] | undefined;
      expect(guards).toContain(LoanBookOwnerGuard);
    });

    it('should protect returnLoan endpoint with LoanBookOwnerGuard', () => {
      const guards = Reflect.getMetadata(
        GUARDS_METADATA,
        LoansController.prototype.returnLoan,
      ) as unknown[] | undefined;
      expect(guards).toContain(LoanBookOwnerGuard);
    });
  });

  describe('createLoan', () => {
    it('should extract userId from current user sub and delegate to service', async () => {
      const dto: CreateLoanDto = {
        livroId: 'book-uuid-abc',
      };
      const currentUser = {
        sub: 'user-uuid-123',
        nome: 'John Doe',
        email: 'john@example.com',
      };

      const mockLoan = {} as LoanEntity;
      service.create.mockResolvedValue(mockLoan);

      const result = await controller.createLoan(currentUser, dto);

      expect(service.create).toHaveBeenCalledWith(dto, currentUser.sub);
      expect(result).toBe(mockLoan);
    });
  });
});
