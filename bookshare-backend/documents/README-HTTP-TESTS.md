# 📋 HTTP Tests - BookShare API

Testes organizados por funcionalidade para validar a API BookShare.

## 📁 Estrutura de Arquivos

```
http-tests/
├── 01-setup.http              # ✅ Rodar PRIMEIRO - Setup inicial
├── 02-create-books.http       # Testes de criação de livros
├── 03-create-loans.http       # Testes de criação de empréstimos
├── 04-findall.http            # Testes de listagem (findAll)
├── 05-findone.http            # Testes de busca por ID (findOne) - TDD
├── 06-business-rules.http     # Testes de regras de negócio
└── README.md                  # Este arquivo
```

---

## 🚀 Como Usar

### 1. **VS Code REST Client**
Instale a extensão: `REST Client` de Huachao Mao

### 2. **Ordem de Execução**
```
1. 01-setup.http              ← SEMPRE RODAR PRIMEIRO
2. 02-create-books.http       ← Criar livros adicionais
3. 03-create-loans.http       ← Criar empréstimos
4. 04-findall.http            ← Listar todos
5. 05-findone.http            ← Buscar por ID (TDD)
6. 06-business-rules.http     ← Validar regras
```

### 3. **Executar um Teste**
- Abra qualquer arquivo `.http`
- Clique em **"Send Request"** acima do endpoint
- Veja a resposta no painel lateral

---

## 📄 Descrição dos Arquivos

### **01-setup.http** 🔧
**Objetivo:** Criar dados iniciais para os testes

**Testes:**
- ✅ Criar usuário DONO
- ✅ Criar usuário LEITOR 1
- ✅ Criar usuário LEITOR 2
- ✅ Criar livro base
- ✅ Criar livro do dono

**Status Esperado:** 201 Created

---

### **02-create-books.http** 📚
**Objetivo:** Testar criação de livros

**Testes:**
- ✅ Criar Livro 1
- ✅ Criar Livro 2
- ✅ Criar Livro 3
- ✅ Criar Livro 4

**Status Esperado:** 201 Created

---

### **03-create-loans.http** 🔗
**Objetivo:** Testar criação de empréstimos

**Testes:**
- ✅ Empréstimo com sucesso (Leitor 1)
- ✅ 1º empréstimo Leitor 2
- ✅ 2º empréstimo Leitor 2
- ✅ 3º empréstimo Leitor 2

**Status Esperado:** 201 Created

---

### **04-findall.http** 📖
**Objetivo:** Testar listagem de todos os registros

**Testes (Ciclo: GREEN ✅):**
- ✅ `GET /books` → Lista todos os livros
- ✅ `GET /users` → Lista todos os usuários
- ✅ `GET /loans` → Lista todos os empréstimos

**Status Esperado:** 200 OK

---

### **05-findone.http** 🔍
**Objetivo:** Testar busca por ID (TDD Pattern)

**Testes (Ciclo: RED → GREEN):**

#### Books:
- ✅ **Sucesso (200):** `GET /books/{id}` → Retorna o livro
- ❌ **Falha (404):** `GET /books/00000000...` → "Livro não encontrado."

#### Users:
- ✅ **Sucesso (200):** `GET /users/{id}` → Retorna o usuário
- ❌ **Falha (404):** `GET /users/00000000...` → "Usuário não encontrado."

#### Loans:
- ✅ **Sucesso (200):** `GET /loans/{id}` → Retorna o empréstimo
- ❌ **Falha (404):** `GET /loans/00000000...` → "Empréstimo não encontrado."

---

### **06-business-rules.http** ⚖️
**Objetivo:** Validar regras de negócio

**Testes:**

#### Teste B - Livro Já Emprestado
```
POST /loans/{leitor2}
Body: { "livroId": "{{livro.id}}" }
Esperado: 400 Bad Request
Mensagem: "Livro já está emprestado"
```

#### Teste C - Dono Pega Próprio Livro
```
POST /loans/{dono}
Body: { "livroId": "{{livro_do_dono.id}}" }
Esperado: 400 Bad Request
Mensagem: "Você não pode pegar emprestado seu próprio livro"
```

#### Teste D - Limite de Empréstimos
```
POST /loans/{leitor2}
Body: { "livroId": "{{l4.id}}" }
Esperado: 400 Bad Request
Mensagem: "Usuário já possui o limite de 3 empréstimos ativos"
```

---

## 🎯 Padrões Aplicados

### **Variables (Refs)**
```
{{nome_da_requisicao.response.body.campo}}
```

Exemplo:
```
POST /loans/{{dono.response.body.id}}
```

### **Named Requests**
```
# @name meu_teste
POST http://localhost:3000/...
```

### **Comments**
```
# Comentário explicativo
```

---

## ✨ Características

- ✅ Testes isolados por funcionalidade
- ✅ Variáveis compartilhadas entre requisições
- ✅ Comentários explicativos
- ✅ Status HTTP esperado em cada teste
- ✅ Ordem de execução definida
- ✅ Pronto para TDD (RED/GREEN)
- ✅ Fácil de manter e expandir

---

## 🧪 Cenários Cobertos

| Arquivo | Funcionalidade | Casos de Teste |
|---------|----------------|----------------|
| 01-setup | Setup | 5 |
| 02-create-books | Create (Books) | 4 |
| 03-create-loans | Create (Loans) | 4 |
| 04-findall | Read All | 3 |
| 05-findone | Read One | 6 (3 sucesso + 3 erro 404) |
| 06-business-rules | Business Logic | 3 |
| **TOTAL** | **-** | **25 testes** |

---

## 🔗 Endpoints da API

| Método | Rota | Arquivo |
|--------|------|---------|
| POST | `/users` | 01-setup |
| POST | `/books` | 01-setup, 02-create-books |
| POST | `/loans/{userId}` | 03-create-loans, 06-business-rules |
| GET | `/users` | 04-findall |
| GET | `/books` | 04-findall |
| GET | `/loans` | 04-findall |
| GET | `/users/{id}` | 05-findone |
| GET | `/books/{id}` | 05-findone |
| GET | `/loans/{id}` | 05-findone |

---

## 📌 Notas Importantes

1. **Setup Obrigatório:** Sempre rodar `01-setup.http` primeiro
2. **Porta Padrão:** `http://localhost:3000`
3. **Database:** PostgreSQL com usuário `mrn` e senha `Ping2012`
4. **Variables:** Salvas durante a sessão do REST Client
5. **TDD Pattern:** Veja `05-findone.http` para o padrão RED/GREEN

---

## 🐛 Troubleshooting

### "Connection Refused"
```
Verifique se o servidor está rodando:
$ pnpm start:dev
```

### "Port Already in Use"
```
Mude a porta em .env:
PORT=3001
```

### "Variable is undefined"
```
Certifique-se de que rodou 01-setup.http primeiro
```

---

**Status:** ✅ Organizado e Funcional  
**Data:** 26/05/2026  
**Estrutura:** Dividido por funcionalidade  
**Padrão:** TDD (findOne com RED/GREEN)
