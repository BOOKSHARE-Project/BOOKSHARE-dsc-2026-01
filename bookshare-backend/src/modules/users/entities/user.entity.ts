import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
    id: string;

    @Column({ name: 'nome', type: 'varchar', length: 255 })
    nome: string;

    @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'senha', type: 'varchar', length: 255 })
    senha: string;

    @Column({ name: 'reputacao', type: 'float', default: 5.0 })
    reputacao: number;

    @Column({ name: 'has_multas_pendentes', type: 'boolean', default: false })
    hasMultasPendentes: boolean;

    @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}

export class User {
  constructor(
    public id: string,
    public nome: string,
    public email: string,
    public senha: string,
    public reputacao: number,
    public hasMultasPendentes: boolean,
  ) {}
}