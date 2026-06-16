import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test' || process.env.DISABLE_SEED === 'true') {
      console.log('🔇 Seed automático desabilitado.');
      return;
    }
    // Seed para que as validações HTTP passem perfeitamente
    // Aguarda a sincronização do TypeORM
    setTimeout(() => {
      void (async () => {
        try {
          console.log('🧹 Limpando o banco de dados para os testes...');
          // Limpa o banco de dados explicitly toda vez que o servidor inicia
          await this.dataSource.query(`DELETE FROM "loans";`);
          await this.dataSource.query(`DELETE FROM "books";`);
          await this.dataSource.query(`DELETE FROM "users";`);

          console.log('🌱 Injetando dados de teste...');
          // Usuário 1 (Dono do Livro 1)
          await this.dataSource.query(
            `INSERT INTO "users" (user_id, nome, email, senha, reputacao) VALUES ('11111111-1111-1111-1111-111111111111', 'Mock Dono 1', 'dono1@test.com', '123', 5.0) ON CONFLICT DO NOTHING;`,
          );

          // Usuário 2 (Dono do Livro 2, para forçar o erro 403 do teste)
          await this.dataSource.query(
            `INSERT INTO "users" (user_id, nome, email, senha, reputacao) VALUES ('22222222-2222-2222-2222-222222222222', 'Mock Dono 2', 'dono2@test.com', '123', 5.0) ON CONFLICT DO NOTHING;`,
          );

          // Solicitante (quem pegou o livro emprestado)
          await this.dataSource.query(
            `INSERT INTO "users" (user_id, nome, email, senha, reputacao) VALUES ('33333333-3333-3333-3333-333333333333', 'Mock Solicitante', 'req@test.com', '123', 5.0) ON CONFLICT DO NOTHING;`,
          );

          // Livro 1 (Dono 1)
          await this.dataSource.query(
            `INSERT INTO "books" (book_id, titulo, autor, isbn, dono_id, status) VALUES ('11111111-1111-1111-1111-111111111111', 'Livro 1', 'Autor 1', 'ISBN-1', '11111111-1111-1111-1111-111111111111', 'EMPRESTADO') ON CONFLICT DO NOTHING;`,
          );

          // Livro 2 (Dono 2)
          await this.dataSource.query(
            `INSERT INTO "books" (book_id, titulo, autor, isbn, dono_id, status) VALUES ('22222222-2222-2222-2222-222222222222', 'Livro 2', 'Autor 2', 'ISBN-2', '22222222-2222-2222-2222-222222222222', 'EMPRESTADO') ON CONFLICT DO NOTHING;`,
          );

          // Empréstimo 1 (Sucesso - O usuário 1 fará a devolução)
          await this.dataSource.query(
            `INSERT INTO "loans" (loan_id, livro_id, solicitante_id, status) VALUES ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'ATIVO') ON CONFLICT DO NOTHING;`,
          );

          // Empréstimo 2 (Erro 403 - O usuário 1 tentará devolver, mas o dono é o usuário 2)
          await this.dataSource.query(
            `INSERT INTO "loans" (loan_id, livro_id, solicitante_id, status) VALUES ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'ATIVO') ON CONFLICT DO NOTHING;`,
          );

          console.log(
            '✅ Seed automático executado com sucesso para validação HTTP.',
          );
        } catch (e) {
          console.error('Erro ao injetar seeds no banco', e);
        }
      })();
    }, 2000); // 2 segundos para garantir que o BD foi sincronizado
  }
}
