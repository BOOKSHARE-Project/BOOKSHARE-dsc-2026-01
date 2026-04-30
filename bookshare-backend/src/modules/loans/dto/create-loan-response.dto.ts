import { LoanStatus } from '../../../common/enums/loan-status.enum';

export class CreateLoanResponseDto {
  loanId!: string;
  livroId!: string;
  status!: LoanStatus;
  dataSolicitacao!: Date;
  message!: string;
}