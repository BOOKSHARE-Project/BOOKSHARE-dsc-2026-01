# Relatório de Uso de IA - UC03

Neste relatório explico como a Inteligência Artificial (Antigravity) foi acionada, orientada e fragmentada para gerar a funcionalidade completa do UC03 seguindo as práticas de **TDD, Clean Architecture e Refatoração contínua**, divididas sistematicamente por *branches*.

A IA atuou como uma *Pair Programmer*, sendo rigorosamente direcionada através de prompts atômicos.

## Fluxo por Branches e Prompts


### 0. Utilizei a IA para me dar um feedback para casa issue e subissue para simular o trabalho do revisor.

### 1. `feature/uc03-01-red-phase-tests`
**O Prompts Direcionado:**
Foi solicitado à IA para que atuasse como um "Desenvolvedor Backend" implementando testes estritos para a Fase RED do TDD utilizando a extensão REST Client (`tests/api/uc03-return.http`). O prompt definiu regras claras: os cenários deviam cobrir Sucesso, 404 (Não Encontrado) e 403 (Usuário não é o dono), e a execução obrigatória não deveria ser implementada antes do teste falhar.
**Uso de IA:** A IA desenhou os cenários no `.http` formatando os headers (ex: `Authorization: Bearer`). 

### 2. `feature/uc03-02-repository-pattern`
**O Prompt Direcionado:**
O usuário pediu à IA a criação de uma **transação no Repository**. O prompt introduziu uma regra estrita: "Um registro de empréstimo e seu retorno alteram três tabelas... A implementação no TypeORM deve utilizar Transações (QueryRunner)".
**Uso de IA:** A IA modelou `registerReturnTransaction` em `LoansTypeOrmRepository` para garantir atualizações atômicas. Ela evitou o uso de regras de negócio, focando 100% no comportamento de banco de dados e rollback atômico.

### 3. `feature/uc03-03-business-rules`
**O Prompt Direcionado:**
Nesta fase, pediu-se à IA para implementar as **regras de negócio no Service**. Regra estrita imposta: "O Service não pode depender de objetos HTTP". Foi delegada à IA a missão de codificar o método `returnLoan`, validando o dono (RN02), chamando a lógica de redução de reputação (RN05/RN06) e conectando à transação criada na branch anterior.
**Uso de IA:** A IA foi muito eficaz ao mapear as exceções (`ForbiddenException`, `NotFoundException`) do NestJS e centralizar todo o cálculo de atraso usando o objeto `Date` sem tocar no controller.

### 4. `feature/uc03-04-endpoint-devolucao-do-emprestimo`
**O Prompt Direcionado:**
O prompt focou na camada final: "Crie a camada de roteamento... extraia o ID do empréstimo... o controller não deve conter regras de negócio".
**Uso de IA:** A IA implementou o controller. Durante o processo de validação "GREEN" do TDD, a IA e o usuário enfrentaram o erro comum de BDs limpos no NestJS (`dropSchema: true`). Por iniciativa do fluxo analítico, a IA propôs e desenvolveu um `SeedService` elegante para popular o banco de dados via raw SQL no `onModuleInit` e ajustou os testes `.http` para enviar `UUIDs` válidos exigidos pelo PostgreSQL, o que resultou em testes verdes limpos, preservando o código de produção livre de mocks.

### 5. `REFACTOR e Documentação`
**O Prompt Direcionado:**
Na reta final, foi pedido para revisar variáveis e remover código morto sem alterar comportamento, e gerar essa documentação dividida em pastas.
**Uso de IA:** A IA analisou `loans.service.ts`, renomeou variáveis matemáticas baseadas em Unix Epoch (`msPerDay` virou `MILLISECONDS_IN_A_DAY`) aprimorando o `Clean Code`. Em seguida, utilizou geração estruturada de Markdown para produzir `overview.md`, `architecture.md`, `api-contract.md` e a atualização central no repositório.

## Conclusão
O modelo de atuação da IA mostrou forte alinhamento a regras impostas. Impedindo-a de gerar código acoplado, garantimos uma infraestrutura baseada 100% no princípio SOLID e Injeção de Dependência através de pequenos comandos modulares e contextuais, consolidando o UC03 sem gerar débito técnico.
