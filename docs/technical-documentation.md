# Documentação Técnica e Guia Arquitetural — BOOKSHARE

Este documento serve como o guia arquitetural e técnico oficial para o projeto BOOKSHARE. Ele deve ser consultado e seguido por toda a equipe de desenvolvedores e agentes de IA que contribuírem com código para esta base.

## 1. Visão Geral e Stack Tecnológico

O BOOKSHARE é uma plataforma colaborativa desenvolvida para facilitar o empréstimo de livros físicos entre usuários, possuindo um sistema de gestão de confiança e reputação.

As tecnologias e ferramentas base configuradas neste projeto são:

* **Framework Base:** NestJS (v11)
* **Linguagem:** TypeScript
* **ORM e Banco de Dados:** TypeORM com PostgreSQL (`pg`)
* **Testes:** Jest e ts-jest (foco em TDD)
* **Qualidade de Código:** ESLint e Prettier
* **Validação:** `class-validator` e `class-transformer`

## 2. Arquitetura e Estrutura de Diretórios

A aplicação segue uma arquitetura baseada em módulos de domínio (*Domain-Driven Design* simplificado), visando um alto desacoplamento e testabilidade.

A pasta principal de código está em `src/`, organizada da seguinte forma:

* **`src/modules/`**: Contém os diferentes domínios da aplicação (ex: `books`, `loans`, `users`).
* **`src/common/`**: Contém lógicas, enumeradores (`enums`), e exceções (`exceptions`) globais compartilhados por vários módulos.

### O Padrão de Repositórios (Interfaces vs Implementações)
Nós utilizamos rigorosamente o padrão *Repository* para a camada de persistência. A regra central é:
**Nenhum *Service* (caso de uso) deve depender diretamente do TypeORM ou do Banco de Dados.**

Para alcançar isso:
1. No módulo de domínio, define-se uma interface (ex: `loans.repository.interface.ts`) detalhando os contratos de persistência.
2. Cria-se a implementação concreta (ex: `loans-typeorm.repository.ts`) que consome o repositório nativo do TypeORM.
3. A injeção de dependência é feita através de **Tokens** customizados (detalhado mais adiante na seção de Padrões).

## 3. Modelagem de Domínio e Regras de Negócio

Os três domínios principais do sistema (Atores e Entidades) são:
* **Usuário (`User`)**: Entidade que empresta e solicita livros, avalia e é avaliada. Possui reputação e histórico de multas.
* **Livro (`Book`)**: Pertence a um Usuário. Possui status de disponibilidade (`DISPONIVEL`, `EMPRESTADO`).
* **Empréstimo (`Loan`)**: Registro temporal que relaciona um Livro, um Solicitante e o Status da transação.

### Caso de Uso Principal Implementado: Solicitar um Empréstimo
O principal fluxo implementado ocorre em `LoansService.create()`. Para que um empréstimo seja criado com sucesso (status `PENDENTE`), as seguintes regras de negócio estritas são validadas na ordem:

1. **Validação do Usuário e Multas:** O solicitante deve existir e não pode ter multas pendentes.
2. **Reputação Mínima:** O usuário precisa ter uma reputação igual ou superior a `4.0`.
3. **Limite de Empréstimos Ativos:** Um usuário só pode possuir no máximo 3 empréstimos simultâneos em andamento.
4. **Disponibilidade do Livro:** O livro desejado deve existir e o seu status precisa ser estritamente `DISPONIVEL`.
5. **Autonomia de Livros Próprios:** O usuário está proibido de solicitar empréstimo para um livro que ele mesmo cadastrou (dono).

Assim que o empréstimo é criado, o sistema altera o status do livro no banco para `EMPRESTADO`.

---

## 4. Padrões e Guidelines (CRÍTICO)

As seguintes regras são leis dentro deste repositório e **não devem ser ignoradas** sob nenhuma circunstância.

### A. Injeção de Dependência via Tokens
O vínculo entre a Interface e a Implementação do Repositório deve ser feito obrigatoriamente no arquivo do módulo (`*.module.ts`), usando um `Symbol` ou `String` (ex: `LOANS_REPOSITORY`).

**Exemplo correto de provisão no Módulo:**
```typescript
{
  provide: LOANS_REPOSITORY,
  useClass: LoansTypeOrmRepository,
}
```

**Exemplo correto de injeção no Service:**
```typescript
constructor(
  @Inject(LOANS_REPOSITORY)
  private readonly loansRepository: LoansRepository // Interface, nunca a classe TypeORM!
) {}
```

### B. Fluxo de Lançamento de Exceções de Domínio Customizadas
A regra de negócio e os serviços de domínio não devem lançar exceções genéricas HTTP (`BadRequestException`, `NotFoundException` etc.) do NestJS nativamente.
* Você deve criar/utilizar classes específicas de exceção localizadas em `src/common/exceptions/business.exceptions.ts` (ex: `UserLowReputationException`, `MaxActiveLoansExceededException`).
* Isso mantém o domínio limpo, expressivo e independente do contexto de entrega HTTP.

### 🚨 C. USO OBRIGATÓRIO DE TDD (Test-Driven Development) 🚨
> [!CAUTION]
> **O USO DO CICLO RED-GREEN-REFACTOR É MANDATÓRIO.**

**NENHUMA nova funcionalidade, alteração de regra de negócio ou refatoração estrutural deve ser iniciada sem que os testes unitários (`*.spec.ts`) sejam criados primeiro.**

O ciclo de desenvolvimento aceitável para qualquer Dev ou Agente de IA neste projeto é:
1. **RED:** Escreva o teste que reflete a regra de negócio esperada. Rode o teste. Ele DEVE falhar.
2. **GREEN:** Escreva a quantidade mínima de código de produção (na classe/serviço) estritamente necessária para fazer o teste passar.
3. **REFACTOR:** Refatore o código para atingir um design limpo e adequar às guidelines arquiteturais acima, mantendo os testes passando a cada alteração.

Se houver uma Pull Request, Commits ou requisições de geração de código que incluam código de produção sem o seu correspondente arquivo de teste garantindo o comportamento previamente, a submissão será sumariamente rejeitada.
