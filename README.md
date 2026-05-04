# 📚 BOOKSHARE

Plataforma de compartilhamento de livros entre usuários, permitindo empréstimos controlados, avaliações e gestão de reputação.

---

## 🎯 Objetivo

Facilitar o compartilhamento de livros físicos entre usuários, promovendo acesso ao conhecimento e reduzindo custos.

---

## 🚀 Funcionalidades

* Cadastro de usuários
* Autenticação
* Cadastro de livros
* Busca de livros disponíveis
* Solicitação de empréstimos
* Aprovação de empréstimos
* Registro de devolução com cálculo de atrasos
* Avaliação entre usuários e sistema de reputação
* Limite dinâmico de empréstimos por usuário

---

## 🧠 Regras de Negócio Principais

* Usuário não pode solicitar empréstimo do seu próprio livro.
* Usuário não pode possuir mais de 3 empréstimos simultâneos.
* Um livro só pode ter um empréstimo ativo por vez (status: DISPONÍVEL).
* Usuários com multas pendentes são bloqueados de novos empréstimos.
* Atrasos na devolução geram redução de 0.5 na reputação por dia de atraso.
* Apenas o dono do livro pode aprovar empréstimos.

---

## 📊 Sistema de Reputação

| Média     | Limite de Livros | Acesso ao Sistema |
| --------- | ---------------- | ----------------- |
| 0 - 2.9   | 1 livro          | Restrito          |
| 3.0 - 3.9 | 2 livros         | Normal            |
| 4.0 - 5.0 | 3 livros         | Total             |

---

## 🏗️ Arquitetura

Backend estruturado em camadas seguindo princípios de Clean Architecture e SOLID:

* **Controller:** Recebe requisições HTTP e valida DTOs.
* **Service:** Orquestra a lógica de negócio e regras de domínio.
* **Repository:** Contratos (Interfaces/Abstract Classes) para injeção de dependência.
* **Entity:** Modelos de domínio ricos em regras.
* **Database:** Atualmente utilizando repositórios *In-Memory* para isolamento de testes unitários. Preparado para transição para ORM.

---

## 📦 Entidades

* Usuário
* Livro
* Empréstimo
* Avaliação
* Notificação

---

## 🔌 Endpoints Principais

* `POST /users` - Cadastrar usuário
* `GET /users/{id}` - Buscar perfil do usuário
* `POST /books` - Cadastrar livro
* `GET /books/{id}` - Buscar livro
* `POST /loans` - Solicitar empréstimo
* `PUT /loans/{id}/approve` - Aprovar empréstimo
* `PUT /loans/{id}/return` - Registrar devolução

---

## ⚙️ Tecnologias

* **Backend:** Node.js, NestJS, TypeScript
* **Testes:** Jest (TDD / Testes Unitários)
* **Banco de Dados (Previsto):** PostgreSQL
* **Containerização (Prevista):** Docker & Docker Compose

---

## 👤 Autor

Gabriel Moreno

---

## 📌 Status do Projeto

Em desenvolvimento