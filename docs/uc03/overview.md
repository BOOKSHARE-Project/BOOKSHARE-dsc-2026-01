# Visão Geral (Overview) - UC03: Registrar Devolução de Livro

O **UC03** é responsável por permitir que o proprietário de um livro confirme a devolução de um exemplar emprestado anteriormente. Esta etapa finaliza o ciclo de empréstimo do livro e atualiza o estado geral do sistema, garantindo a consistência na disponibilidade do acervo e aplicando penalidades em caso de atraso na devolução.

## Regras de Negócio Implementadas

* **Validação de Propriedade**: Apenas o dono original do livro pode confirmar a devolução. Solicitações feitas pelo tomador do empréstimo (borrower) ou por terceiros são rejeitadas com erro `403 Forbidden`.
* **Disponibilidade**: Ao confirmar a devolução, o `status` do livro volta a ser `DISPONIVEL` para outros usuários.
* **Ciclo de Vida do Empréstimo**: O `status` do registro de empréstimo passa de `ATIVO` para `DEVOLVIDO`.
* **Lógica de Atraso e Reputação**: O sistema calcula o atraso comparando a data atual com a `dataRetornoPrevista`. Se houver atraso, o sistema reduz em `0.5` a reputação do usuário que pegou o livro emprestado, com o limite mínimo de `0` na reputação.

## Estratégia de Implementação (TDD)
O desenvolvimento seguiu rigorosamente a abordagem de Test-Driven Development (TDD) dividida em pequenas fases (RED e GREEN). Começamos construindo os testes `.http`, que inicialmente falhavam (Fase RED), para então construir a infraestrutura do `Repository`, as regras de negócio no `Service`, e por fim a exposição limpa da rota pelo `Controller` (Fase GREEN). Tudo suportado por uma injeção automática de `Seed` no banco de dados garantindo a integridade dos testes de validação.
