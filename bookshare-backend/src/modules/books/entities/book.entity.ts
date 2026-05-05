import { BookStatus } from '../../../common/enums/book-status.enum';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('books')
export class BookEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'book_id' })
    id: string;

    @Column({ name: 'titulo', type: 'varchar', length: 255 })
    titulo: string;

    @Column({ name: 'autor', type: 'varchar', length: 255 })
    autor: string;

    @Column({ name: 'isbn', type: 'varchar', length: 50, unique: true })
    isbn: string;

    @Column({
        type: 'enum',
        enum: BookStatus,
        default: BookStatus.DISPONIVEL,
    })
    status: BookStatus;

    @Column({ name: 'dono_id', type: 'uuid' })
    donoId: string;

    @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;
}

export class Book {
  constructor(
    public id: string,
    public titulo: string,
    public autor: string,
    public isbn: string,
    public status: BookStatus,
    public donoId: string,
  ) {}
}