# Visão Geral — Sistema BOOKSHARE

## Descrição

O BOOKSHARE é um sistema web/mobile desenvolvido para permitir o compartilhamento de livros físicos entre usuários, por meio de um mecanismo controlado de empréstimos, avaliações e gestão de reputação.

## Problema

Livros possuem alto custo de aquisição e, na grande maioria das vezes, ficam ociosos nas estantes após a leitura. O sistema busca resolver o problema da baixa circulação de conhecimento e da subutilização de exemplares físicos.

## Solução

Criar uma plataforma colaborativa onde usuários possam:

* Cadastrar livros de sua propriedade.
* Solicitar empréstimos do acervo de outros usuários.
* Aprovar e gerenciar solicitações recebidas.
* Registrar devoluções de forma segura.
* Avaliar outros usuários, alimentando um sistema de confiança mútuo.

## Público-Alvo

* Estudantes universitários e secundaristas.
* Leitores assíduos.
* Comunidades acadêmicas e bibliotecas comunitárias.
* Clubes de leitura.

## Objetivos

* Aumentar exponencialmente a circulação de livros físicos.
* Reduzir o custo de aquisição de literatura e material de estudo.
* Criar uma rede de compartilhamento altamente confiável.
* Automatizar o controle de empréstimos e penalidades por atraso.

## Escopo do Sistema

**Inclui:**
* Cadastro e gestão de usuários.
* Cadastro e catálogo de livros.
* Fluxo de empréstimos (Solicitação, Aprovação, Devolução).
* Sistema de penalidades (Multas e redução de reputação por atraso).
* Avaliações de usuários.

**Não inclui:**
* Venda ou comercialização de livros.
* Intermediação de pagamentos ou taxas financeiras.
* Logística de entrega ou frete dos livros (o encontro é combinado entre as partes).

## Atores

* **Usuário:** Interage com a plataforma solicitando, emprestando e avaliando.
* **Sistema:** Automatiza regras de negócio, bloqueios preventivos, transições de status e notificações.

## Domínio

O domínio central da aplicação é o **Gerenciamento Seguro de Empréstimos**. Todo o desenvolvimento é guiado pelas regras de negócio e testado via *Test-Driven Development* (TDD) para garantir a consistência de dados antes de qualquer persistência em banco.

## Entidades Principais

* **Usuário**
* **Livro**
* **Empréstimo**
* **Avaliação**
* **Notificação**

## Diferenciais

* **Sistema Dinâmico de Reputação:** O limite de empréstimos cresce ou diminui com base no comportamento do usuário.
* **Bloqueios Preventivos:** Usuários inadimplentes ou com reputação baixa são automaticamente barrados pelo sistema.
* **Arquitetura Desacoplada:** Desenvolvido com NestJS e TypeScript, garantindo alta testabilidade e fácil manutenção.

## Resultado Esperado

Uma plataforma robusta, colaborativa e de código limpo que incentive o compartilhamento de livros de forma segura, descentralizada e organizada.