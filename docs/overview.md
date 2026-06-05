# Visão Geral (Overview) — BOOKSHARE

O **BOOKSHARE** é uma plataforma colaborativa desenvolvida para gerenciar o compartilhamento e empréstimo de livros físicos de forma segura e controlada entre usuários. O ecossistema promove o acesso ao conhecimento, redução de custos e controle de confiabilidade por meio de regras de elegibilidade estritas, cálculo automático de penalidades por atraso na devolução e um sistema de reputação dinâmico.

---

## 🚀 Módulos e Funcionalidades Principais

### 🔒 1. Segurança e Autenticação (`AuthModule` & Cryptography)
* **Criptografia de Senhas**: Armazenamento seguro de senhas dos usuários utilizando hash forte via **BCrypt**, abstraído por uma interface genérica de provedor (`HashProvider`).
* **Autenticação JWT**: Geração de tokens de acesso seguros (`accessToken`) de padrão Bearer para autenticar sessões de usuários de forma sem estado (stateless).
* **Tratamento de Exceções customizado**: Validação de e-mails duplicados com lançamento de exceção de domínio personalizada (`DuplicateEmailException`) e validação de login inválido.

### 👤 2. Gestão de Usuários e CRUD (`UsersModule`)
* **Cadastro e Edição de Perfil**: Cadastro aberto (`POST /users`), além de rotas protegidas para busca, edição e deleção de perfis.
* **Consulta de Perfil Expandido (`UC04`)**: Endpoint `GET /users/:id/profile` que retorna o nível de acesso do usuário, limite de livros permitidos e reputação dinâmica atual.

### 📚 3. Acervo de Livros (`BooksModule`)
* **Gerenciamento de Obras**: Cadastro, listagem, atualização e exclusão física de livros do acervo.
* **Validação de Propriedade**: Garantia de que apenas o dono do livro tem a permissão para editar ou excluir seus exemplares da plataforma.

### 🤝 4. Empréstimos e Devoluções (`LoansModule`)
* **Solicitação de Empréstimo (`UC01`)**: Permite reservar livros disponíveis, respeitando o limite individual de empréstimos, reputação mínima exigida e impedimento de auto-empréstimo.
* **Aprovação de Empréstimo (`UC02`)**: O proprietário do livro analisa e aprova formalmente a solicitação de empréstimo.
* **Registrar Devolução (`UC03`)**: O proprietário confirma a devolução do livro. Se houver atraso comparado à data de retorno prevista, calcula-se uma redução automática de `0.5` na reputação do solicitante por dia de atraso (com piso de `0.0`).

---

## 🛡️ Sistema de Proteção e Guardas (Authorization Guards)

O sistema implementa uma estratégia de defesa em profundidade por meio de Guards especializados aplicados às rotas da API:
1. **`JwtAuthGuard`**: Garante que o usuário forneceu um Bearer Token (JWT) válido no header `Authorization`.
2. **`UserSelfGuard`**: Restringe o acesso aos endpoints do CRUD de usuários, garantindo que o usuário autenticado só possa consultar, editar ou remover a sua própria conta.
3. **`BookOwnerGuard`**: Garante que apenas o proprietário do livro possa executar operações de atualização (`PATCH`) ou deleção (`DELETE`) no livro correspondente.
4. **`LoanBookOwnerGuard`**: Garante que apenas o dono legítimo do livro associado ao empréstimo possa aprovar a solicitação (`/approve`) ou confirmar a devolução (`/return`).

---

## 🧪 Estratégia de Validação

O desenvolvimento foi guiado pelos ciclos do **TDD (Red-Green-Refactor)**:
* **Testes Estruturais (Jest)**: Executados via `pnpm test`, cobrindo unitariamente os services, guards, controllers e transações dos repositórios.
* **Testes de Integração E2E (REST Client)**: Realizados através dos arquivos `.http` em `bookshare-backend/` (`requests.http`, `auth-validation.http` e `auth-guards.http`). Eles exercitam a aplicação local contra o banco PostgreSQL em cenários felizes e infelizes (como erros 401 Unauthorized e 403 Forbidden).
