# Contrato de API - UC03

Este documento descreve o contrato (API Contract) para o endpoint de devolução de empréstimo.

## Rota: Confirmar Devolução
Atualiza o status de um empréstimo ativo para `DEVOLVIDO` e libera o livro correspondente, atualizando a reputação do locatário em caso de atraso.

**Endpoint:** `PUT /loans/:id/return`

**Headers Obrigatórios:**
* `Authorization`: `Bearer <token>` (Token JWT do proprietário do livro)

**Parâmetros de Rota:**
* `id`: (UUID) ID do empréstimo a ser finalizado.

### Respostas

#### 1. Sucesso
**HTTP 200 OK**
```json
{
  "loanId": "11111111-1111-1111-1111-111111111111",
  "statusEmprestimo": "DEVOLVIDO",
  "statusLivro": "DISPONIVEL",
  "reputacaoAtualizada": 4.5
}
```
*(Nota: `reputacaoAtualizada` será omitido do JSON se não houver cálculo de atraso)*

#### 2. Erro: Empréstimo não encontrado
**HTTP 404 Not Found**
```json
{
  "message": "Empréstimo não encontrado.",
  "error": "Not Found",
  "statusCode": 404
}
```

#### 3. Erro: Usuário sem permissão
Lançado se o `userId` (extraído do Token) for diferente do `donoId` do livro.
**HTTP 403 Forbidden**
```json
{
  "message": "Usuário não é dono do livro.",
  "error": "Forbidden",
  "statusCode": 403
}
```

#### 4. Erro: O empréstimo não está ativo
**HTTP 400 Bad Request**
```json
{
  "message": "O empréstimo não está ativo para ser devolvido.",
  "error": "Bad Request",
  "statusCode": 400
}
```
