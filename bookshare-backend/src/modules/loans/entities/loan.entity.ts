import { LoanStatus } from "src/common/enums/loan-status.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('loans')
export class LoanEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'loan_id' })
    loanId: string;

    @Column({ name: 'livro_id', type: 'uuid' })
    bookId: string;

    @Column({ name: 'solicitante_id', type: 'uuid' })
    requesterId: string;

    @Column({
        type: 'enum',
        enum: LoanStatus,
        default: LoanStatus.PENDENTE,
    })
    status: LoanStatus;

    @Column({ name: 'data_retorno_prevista', type: 'timestamp', nullable: true })
    dataRetornoPrevista: Date;

    @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}
export class Loan {
  constructor(
    public id: string,
    public livroId: string,
    public solicitanteId: string,
    public status: LoanStatus,
    public dataSolicitacao: Date,  ) {}
}