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
* Registro de devolução
* Avaliação entre usuários
* Sistema de reputação
* Limite de empréstimos por usuário

---

## 🧠 Regras de Negócio Principais

* Usuário não pode solicitar seu próprio livro
* Usuário não pode possuir mais de 3 empréstimos simultâneos
* Um livro só pode ter um empréstimo ativo
* Avaliação só pode ocorrer após devolução
* Limite de empréstimos depende da reputação
* Apenas o dono do livro pode aprovar empréstimos

---

## 📊 Sistema de Reputação

| Média     | Limite de Livros |
| --------- | ---------------- |
| 0 - 2.9   | 1 livro          |
| 3.0 - 3.9 | 2 livros         |
| 4.0 - 5.0 | 3 livros         |

---

## 🏗️ Arquitetura

Backend estruturado em camadas:

* Controller
* Service
* Repository
* Model
* Database

---

## 📦 Entidades

* Usuário
* Livro
* Empréstimo
* Avaliação
* Notificação

---

## 🔌 Endpoints Principais

POST /usuarios
POST /auth/login
POST /livros
GET /livros
POST /emprestimos
PUT /emprestimos/{id}/aprovar
PUT /emprestimos/{id}/devolver

---

## ⚙️ Tecnologias (exemplo)

* Backend: API REST
* Banco: PostgreSQL
* Containerização: Docker
* Frontend: Web App

---

## 👤 Autor

Gabriel Moreno

---

## 📌 Status do Projeto

Em desenvolvimento
