# Documentação Técnica e Guia Arquitetural — BOOKSHARE

Este documento serve como o guia arquitetural e técnico oficial para o projeto BOOKSHARE. Ele deve ser consultado e seguido por toda a equipe de desenvolvedores e agentes de IA que contribuírem com código para esta base.

## 1. Visão Geral e Stack Tecnológico

O BOOKSHARE é uma plataforma colaborativa desenvolvida para facilitar o empréstimo de livros físicos entre usuários, possuindo um sistema de gestão de confiança e reputação.

As tecnologias e ferramentas base configuradas neste projeto são:

* **Framework Base:** NestJS (v11)
* **Linguagem:** TypeScript
* **ORM e Banco de Dados:** TypeORM com PostgreSQL (`pg`)
* **Framework de Testes Automatizados:** Jest (Unitários e de Integração)
* **Ferramenta de Execução de Testes:** `pnpm` (através dos scripts `pnpm test`, `pnpm test:watch` e `pnpm test:cov`)
* **Validação de Endpoints e Contratos:** Requisições HTTP nativas (REST Client com arquivos `.http`)
* **Qualidade de Código:** ESLint e Prettier
* **Validação de Payload:** `class-validator` e `class-transformer`

---

## 2. Arquitetura e Estrutura de Diretórios

A aplicação segue uma arquitetura baseada em módulos de domínio (*Domain-Driven Design* simplificado), visando um alto desacoplamento e testabilidade.

A pasta principal de código está em `src/`, organizada da seguinte forma:

* **`src/modules/`**: Contém os diferentes domínios da aplicação (ex: `books`, `loans`, `users`). 
  * *Regra de Ouro:* Cada pasta de módulo deve conter suas respectivas implementações de código de produção acompanhadas obrigatoriamente de seus arquivos de testes automatizados locais (ex: `books.service.ts` e `books.service.spec.ts`).
* **`src/common/`**: Contém lógicas, enumeradores (`enums`), e exceções (`exceptions`) globais compartilhados por vários módulos.
* **`tests/api/`**: Pasta localizada na raiz do projeto, destinada exclusivamente aos arquivos de teste e validação de contrato HTTP (`*.http`).

### O Padrão de Repositórios (Interfaces vs Implementações)
Nós utilizamos rigorosamente o padrão *Repository* para a camada de persistência. A regra central é:
**Nenhum *Service* (caso de uso) deve depender diretamente do TypeORM ou do Banco de Dados.**

Para alcançar isso:
1. No módulo de domínio, define-se uma interface (ex: `loans.repository.interface.ts`) detalhando os contratos de persistência.
2. Cria-se a implementação concreta (ex: `loans-typeorm.repository.ts`) que consome o repositório nativo do TypeORM.
3. A injeção de dependência é feita através de **Tokens** customizados (detalhado mais adiante na seção de Padrões).
4. Essa separação garante que os testes unitários do *Service* com Jest possam mockar o repositório facilmente através de sua interface, sem necessitar de uma conexão real com o banco de dados.

---

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

### B. Fluxo de Lançamento de Exceções de Domínio Customizadas
A regra de negócio e os serviços de domínio não devem lançar exceções genéricas HTTP (`BadRequestException`, `NotFoundException` etc.) do NestJS nativamente.
* Você deve criar/utilizar classes específicas de exceção localizadas em `src/common/exceptions/business.exceptions.ts` (ex: `UserLowReputationException`, `MaxActiveLoansExceededException`).
* Isso mantém o domínio limpo, expressivo e independente do contexto de entrega HTTP.

### A Estratégia de Dupla Validação 

### Camada Estrutural (Jest via pnpm test): 

Focada em testes unitários e de integração para Services, Controllers e Repositories. Todo arquivo de produção (ex: *.service.ts) deve possuir obrigatoriamente um arquivo de especificação emparelhado (ex: *.service.spec.ts).

### Camada de Contrato/Integração (REST Client via arquivos .http)

Focada em testes funcionais de ponta a ponta (E2E) simulando o comportamento da API real no diretório tests/api/.

### O Ciclo de Desenvolvimento Exigido

#### Fase 1: RED (O Teste que Falha)
Antes de escrever o código de produção, deve-se criar a especificação no Jest (*.spec.ts) mockando as dependências necessárias e/ou mapear a rota pretendida no arquivo .http. Ao rodar o comando pnpm test ou realizar o Send Request, o resultado deve ser uma falha controlada (pois a lógica ainda não existe). Um commit isolado contendo apenas a suíte de testes em estado falho deve ser realizado.

#### Fase 2: GREEN (A Implementação Mínima)
Escreva o código mínimo necessário nas camadas corretas do NestJS para fazer a suíte de testes do Jest passar com sucesso e o arquivo .http retornar o status esperado (200 OK, 201 Created ou códigos de erro de negócio específicos). Execute pnpm test para garantir o sucesso global da aplicação.

#### Fase 3: REFACTOR (Melhoria Contínua de Código)
Com os testes em verde e consolidados, limpe o código de produção, melhore a nomenclatura de variáveis e remova redundâncias aplicando os princípios SOLID.

**IMPORTANTE**
Durante e imediatamente após a refatoração, o comando pnpm test deve ser executado continuamente. Se qualquer teste quebrar, a refatoração deve ser revertida ou corrigida imediatamente para manter a estabilidade do comportamento validado.
