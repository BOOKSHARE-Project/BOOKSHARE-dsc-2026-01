import { LoanStatus } from "src/common/enums/loan-status.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('loans')
export class LoanEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'loan_id' })
    id: string; 

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: Date | null;
}
