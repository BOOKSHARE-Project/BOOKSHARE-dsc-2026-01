# Visão Geral (Overview) - UC03: Registrar Devolução de Livro

O **UC03** é responsável por permitir que o proprietário de um livro confirme a devolução de um exemplar emprestado anteriormente. Esta etapa finaliza o ciclo de empréstimo do livro e atualiza o estado geral do sistema, garantindo a consistência na disponibilidade do acervo e aplicando penalidades em caso de atraso na devolução.

## Regras de Negócio Implementadas

* **Validação de Propriedade**: Apenas o dono original do livro pode confirmar a devolução. Solicitações feitas pelo tomador do empréstimo (borrower) ou por terceiros são rejeitadas com erro `403 Forbidden`.
* **Disponibilidade**: Ao confirmar a devolução, o `status` do livro volta a ser `DISPONIVEL` para outros usuários.
* **Ciclo de Vida do Empréstimo**: O `status` do registro de empréstimo passa de `ATIVO` para `DEVOLVIDO`.
* **Lógica de Atraso e Reputação**: O sistema calcula o atraso comparando a data atual com a `dataRetornoPrevista`. Se houver atraso, o sistema reduz em `0.5` a reputação do usuário que pegou o livro emprestado, com o limite mínimo de `0` na reputação.

## Estratégia de Validação via Requisições HTTP
O desenvolvimento e a validação seguiram a estratégia de testes baseados inteiramente em requisições HTTP (`.http`) via **pnpm** e a extensão REST Client. O fluxo inicia-se disparando as requisições HTTP estruturadas na pasta `tests/api/` contra o servidor em execução local, cobrindo cenários de sucesso e de falha. A infraestrutura do `Repository` realiza as persistências, as regras de negócio são aplicadas no `Service` e a rota é exposta de maneira limpa pelo `Controller`, com o suporte de uma injeção automática de `Seed` no banco de dados para garantir a integridade das validações.
