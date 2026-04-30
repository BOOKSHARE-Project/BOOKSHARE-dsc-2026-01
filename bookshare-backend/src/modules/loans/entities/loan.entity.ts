import { LoanStatus } from "src/common/enums/loan-status.enum";

export class Loan {
  constructor(
    public id: string,
    public livroId: string,
    public solicitanteId: string,
    public status: LoanStatus,
    public dataSolicitacao: Date,
  ) {}
}