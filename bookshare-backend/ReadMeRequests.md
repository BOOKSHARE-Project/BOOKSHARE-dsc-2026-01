## 🧪 Como Executar os Testes da API (request.http)

Este projeto utiliza a extensão **REST Client** do VS Code para testes de integração. O arquivo `request.http` está configurado com variáveis dinâmicas (os IDs gerados alimentam as requisições seguintes), o que exige uma ordem específica de execução.

### 📌 Pré-requisitos
1. Instale a extensão **[REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)** no VS Code.
2. Garanta que o banco de dados está rodando (`docker compose up -d`).
3. Garanta que a API está rodando localmente (`pnpm start:dev`).

---

### 🚀 Passo a Passo de Execução

Abra o arquivo `request.http` e clique em **`Send Request`** (texto que aparece acima de cada rota) seguindo **exatamente** a ordem abaixo:

#### Passo 1: Massa de Dados Inicial (OBRIGATÓRIO)
Vá até a seção **`01-SETUP`** e execute as requisições rigorosamente nesta ordem:
1. `POST` Criar usuário DONO
2. `POST` Criar usuário LEITOR 1
3. `POST` Criar usuário LEITOR 2
4. `POST` Criar livro base
5. `POST` Criar livro do dono

*(Isso salva os IDs temporariamente na memória do VS Code para as próximas requisições).*

#### Passo 2: Carga Adicional de Livros
Vá até a seção **`02-CREATE-BOOKS`** e execute sequencialmente a criação dos Livros 1, 2, 3 e 4.

#### Passo 3: Validação de Regras e Fluxos (Testes Livres)
Com a massa de dados em memória, você pode executar livremente as requisições das seguintes seções:
- **`03-CREATE-LOANS`**: Teste de criação de empréstimos com sucesso.
- **`04-FINDALL`** e **`05-FINDONE`**: Testes de listagem e busca por ID (Sucesso e Falha).
- **`06-BUSINESS-RULES`**: Validação de erros propositais (ex: limite de livros, livro já emprestado, pegar próprio livro).
- **`07-PATCH-UPDATE`**: Atualizações parciais de registros.
- **`09-CONSULTAR PERFIL (UC04)`**: Verificação do perfil dinâmico com cálculo de reputação e limites.

#### Passo 4: Teste de Exclusão (Intervenção Manual)
A seção **`08 - EXCLUSÃO CONTROLADA (DELETE)`** é isolada e exige uma etapa manual:
1. Execute o **`DELETE 1`** para listar os livros.
2. Copie um `id` válido do JSON de resposta.
3. No arquivo `.http`, cole o ID na variável: `@bookIdParaDeletar = cole_o_id_aqui`.
4. Execute os passos **`DELETE 2`, `3`, `4` e `5`** para validar o fluxo de exclusão segura e a confirmação do erro `404 Not Found`.

---

### ⚠️ Solução de Problemas
- **Erro "Variable not found" ou ID `<undefined>`:** Ocorreu porque a memória do REST Client foi limpa (ex: fechou o VS Code). Volte ao topo e execute novamente a seção **`01-SETUP`**.
- **Erro "ECONNREFUSED":** A sua API NestJS não está rodando. Inicie o servidor com `pnpm start:dev` e tente novamente.