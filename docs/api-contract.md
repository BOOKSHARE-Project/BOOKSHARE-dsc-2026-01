# Contrato de API — BOOKSHARE

Este documento define as rotas, payloads de entrada, headers necessários, respostas de sucesso e tratamentos de erro da API do BOOKSHARE.

---

## 🔒 1. Módulo de Autenticação (`/auth`)

### A. Efetuar Login
Valida as credenciais do usuário e emite o token de autenticação JWT Bearer.

* **Rota:** `POST /auth/login`
* **Headers:** 
  * `Content-Type`: `application/json`
* **Corpo da Requisição (Payload):**
  ```json
  {
    "email": "leitor1@teste.com",
    "senha": "senhaSegura123"
  }
  ```
* **Respostas:**
  * **201 Created** (Login bem-sucedido):
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```
  * **401 Unauthorized** (Credenciais inválidas):
    ```json
    {
      "message": "Credenciais inválidas.",
      "error": "Unauthorized",
      "statusCode": 401
    }
    ```

---

## 👤 2. Módulo de Usuários (`/users`)

### A. Cadastrar Usuário (Sign-up)
* **Rota:** `POST /users`
* **Headers:**
  * `Content-Type`: `application/json`
* **Corpo da Requisição:**
  ```json
  {
    "nome": "Fulano de Tal",
    "email": "fulano@teste.com",
    "senha": "senhaSegura123"
  }
  ```
* **Respostas:**
  * **201 Created**:
    ```json
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "nome": "Fulano de Tal",
      "email": "fulano@teste.com",
      "reputacao": 5.0,
      "has_multas_pendentes": false,
      "created_at": "2026-06-05T18:00:00.000Z",
      "updated_at": "2026-06-05T18:00:00.000Z"
    }
    ```
  * **400 Bad Request** (E-mail duplicado):
    ```json
    {
      "message": "O e-mail informado já está em uso.",
      "error": "Bad Request",
      "statusCode": 400
    }
    ```

### B. Listar Todos os Usuários
* **Rota:** `GET /users`
* **Headers:**
  * `Authorization`: `Bearer <token>` (Necessita login)
* **Respostas:**
  * **200 OK**: Retorna um array com todos os usuários cadastrados.

### C. Buscar Usuário por ID
* **Rota:** `GET /users/:id`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Guards:** `UserSelfGuard` (apenas o próprio usuário pode consultar seu perfil direto)
* **Respostas:**
  * **200 OK**: Retorna os detalhes do usuário.
  * **403 Forbidden** (Tentativa de ver dados de outro ID):
    ```json
    {
      "message": "Acesso negado: você não tem permissão para acessar este recurso.",
      "error": "Forbidden",
      "statusCode": 403
    }
    ```

### D. Atualizar Usuário
* **Rota:** `PATCH /users/:id`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Guards:** `UserSelfGuard`
* **Corpo da Requisição:** Campos opcionais (`nome`, `email`, `senha`).
* **Respostas:**
  * **200 OK**: Retorna o usuário modificado.
  * **403 Forbidden**: Caso tente modificar outro usuário.

### E. Deletar Usuário
* **Rota:** `DELETE /users/:id`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Guards:** `UserSelfGuard`
* **Respostas:**
  * **200 OK** (ou sem conteúdo): Usuário removido do sistema.
  * **404 Not Found**: Se o usuário não existir.

### F. Consultar Perfil Expandido (`UC04`)
Fornece informações dinâmicas agregadas de empréstimos e limites do usuário com base em sua reputação.

* **Rota:** `GET /users/:id/profile`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Guards:** `UserSelfGuard`
* **Respostas:**
  * **200 OK**:
    ```json
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "nome": "Fulano de Tal",
      "email": "fulano@teste.com",
      "reputacao": 5.0,
      "nivelAcesso": "Total",
      "limiteEmprestimos": 3,
      "multasPendentes": false
    }
    ```

---

## 📚 3. Módulo de Livros (`/books`)

### A. Listar Livros
* **Rota:** `GET /books`
* **Headers:**
  * `Authorization`: `Bearer <token>`

### B. Cadastrar Livro
* **Rota:** `POST /books`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Corpo da Requisição:**
  ```json
  {
    "titulo": "Arquitetura Limpa",
    "autor": "Robert C. Martin",
    "isbn": "9788550804606",
    "donoId": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6"
  }
  ```

### C. Atualizar/Deletar Livro
* **Rotas:** `PATCH /books/:id` ou `DELETE /books/:id`
* **Headers:**
  * `Authorization`: `Bearer <token>`
* **Guards:** `BookOwnerGuard` (Somente o dono do livro cadastrado tem permissão)
* **Respostas:**
  * **403 Forbidden**: Lançado caso outro usuário tente atualizar ou deletar o livro.

---

## 🤝 4. Módulo de Empréstimos (`/loans`)

### A. Solicitar Empréstimo (`UC01`)
* **Rota:** `POST /loans`
* **Headers:**
  * `Authorization`: `Bearer <token>` (Token do solicitante)
* **Corpo da Requisição:**
  ```json
  {
    "livroId": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e"
  }
  ```
* **Respostas:**
  * **201 Created** (Solicitado com sucesso, status do livro passa para `EMPRESTADO` e empréstimo nasce `PENDENTE`):
    ```json
    {
      "id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
      "livroId": "b1c2d3e4-f5a6-7b8c-9d0e-1f2a3b4c5d6e",
      "solicitanteId": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "status": "PENDENTE",
      "dataRetornoPrevista": "2026-06-19T18:00:00.000Z",
      "created_at": "2026-06-05T18:00:00.000Z"
    }
    ```
  * **400 Bad Request** (Regras de negócio violadas: auto-empréstimo, limite de 3 livros ativos excedido, ou reputação abaixo de 4.0).

### B. Aprovar Empréstimo (`UC02`)
Modifica o status de `PENDENTE` para `ATIVO`.
* **Rota:** `PUT /loans/:id/approve`
* **Headers:**
  * `Authorization`: `Bearer <token>` (Dono do livro)
* **Guards:** `LoanBookOwnerGuard` (Valida se o usuário autenticado é dono do livro emprestado)
* **Respostas:**
  * **200 OK**: Retorna o objeto do empréstimo com status `ATIVO`.
  * **403 Forbidden**: Se o usuário logado não for o dono do livro.

### C. Confirmar Devolução (`UC03`)
Muda o status do empréstimo para `DEVOLVIDO` e do livro para `DISPONIVEL`. Se atrasado, aplica dedução de `0.5` na reputação do solicitante por dia excedente.

* **Rota:** `PUT /loans/:id/return`
* **Headers:**
  * `Authorization`: `Bearer <token>` (Dono do livro)
* **Guards:** `LoanBookOwnerGuard`
* **Respostas:**
  * **200 OK**:
    ```json
    {
      "loanId": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
      "statusEmprestimo": "DEVOLVIDO",
      "statusLivro": "DISPONIVEL",
      "reputacaoAtualizada": 4.5
    }
    ```
    *(Nota: `reputacaoAtualizada` será omitido se a devolução tiver ocorrido no prazo).*
  * **403 Forbidden**: Se o usuário logado não for o dono do livro.
