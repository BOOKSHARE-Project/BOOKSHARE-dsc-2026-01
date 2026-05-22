# Arquitetura - UC03

A implementação do **UC03 (Registrar Devolução de Livro)** foi projetada seguindo os princípios de *Clean Architecture* e Injeção de Dependências já estabelecidos no ecossistema do **NestJS**, dividindo as responsabilidades de forma clara e isolada.

## Camadas Envolvidas

1. **Controller (`LoansController`)**
   - **Responsabilidade**: Camada de roteamento. Recebe a requisição HTTP `PUT /loans/:id/return`.
   - **Regra Estrita**: Isolada de regras de negócio. Extrai o ID do empréstimo da rota e simula a extração do `userId` do token Bearer. Envia os dados para a camada de Serviço.

2. **Service (`LoansService`)**
   - **Responsabilidade**: Executa as Regras de Negócio (validação de propriedade, cálculo de atraso e penalidade de reputação).
   - **Regra Estrita**: Totalmente isolada do contexto HTTP. O serviço não lança objetos de Request/Response, lançando apenas as exceções abstratas do NestJS (que são traduzidas pelo framework).

3. **Repository Interface (`LoansRepository`)**
   - **Responsabilidade**: Define o contrato do que a camada de dados precisa fornecer, isolando o Service do framework do banco de dados (TypeORM).

4. **Repository Implementation (`LoansTypeOrmRepository`)**
   - **Responsabilidade**: Implementação concreta das queries do banco usando `TypeORM`. 
   - **Transação Atômica**: Foi implementado o método `registerReturnTransaction` utilizando o `QueryRunner` do TypeORM para garantir que a atualização das tabelas `loans`, `books` e `users` aconteça de maneira atômica (Rollback em caso de erro no meio do processo).

## Solução de Seed para Testes
Para permitir uma validação perfeita das rotas HTTP em um banco configurado com `dropSchema: true` e uso de tipos `UUID` nativos no PostgreSQL, foi implementado um `SeedService` responsável por injetar dados de teste válidos toda vez que o servidor for iniciado (`onModuleInit`).
