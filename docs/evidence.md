# Evidências da Implementação FASE RED - UC03-1

## Testes 

Comando utilizado: 

pnpm start:dev

## Resultado (RED)

Todos os Testes deram erro

## REGISTROS

### PUT {{baseUrl}}/loans/1/return

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 77
ETag: W/"4d-GTFMHTaQ0NziWzZC2PHJ2URdGUI"
Date: Wed, 20 May 2026 16:00:47 GMT
Connection: close

{
  "message": "Cannot PUT /loans/1/return",
  "error": "Not Found",
  "statusCode": 404
}

### PUT {{baseUrl}}/loans/999/return

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 79
ETag: W/"4f-8xMbeZzzrwHuEzTW50vz0WnijOc"
Date: Wed, 20 May 2026 16:01:06 GMT
Connection: close

{
  "message": "Cannot PUT /loans/999/return",
  "error": "Not Found",
  "statusCode": 404
}

### PUT {{baseUrl}}/loans/2/return

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 77
ETag: W/"4d-oPqRe1MD6dhBOwPiGDfxex+0D04"
Date: Wed, 20 May 2026 16:01:13 GMT
Connection: close

{
  "message": "Cannot PUT /loans/2/return",
  "error": "Not Found",
  "statusCode": 404
}

## Link do PR

https://github.com/BOOKSHARE-Project/BOOKSHARE-dsc-2026-01/pull/18



# Evidências da Implementação Do Repositorio - UC03-2
# Evidências da Implementação Do Repositorio

**Isolamento da Camada de Dados**: Foi adicionada a função `registerReturnTransaction` na interface e na implementação do repositório de empréstimos (`LoansTypeOrmRepository`).
- **Transação Atômica**: Utilização do `QueryRunner` do TypeORM para garantir que todas as atualizações no banco de dados sejam feitas de forma segura e conjunta.
- **Tabelas Afetadas**: A função atualiza atomicamente o status do Empréstimo para `DEVOLVIDO`, o status do Livro para `DISPONIVEL` e, opcionalmente, atualiza a pontuação (`reputacao`) do Usuário se houver atraso.
- **Regras Respeitadas**: Toda regra de cálculo de dias ou validação HTTP ficou de fora, focando 100% na persistência atômica

## Link do PR

https://github.com/BOOKSHARE-Project/BOOKSHARE-dsc-2026-01/pull/19


# Evidências da Implementação Do Service - UC03-3

- **Criação do Método `returnLoan`**: Implementada a lógica principal de devolução, recebendo apenas `loanId` e `userId`.
- **Validações de Regra de Negócio (RN02)**: Verifica se o empréstimo existe e está `ATIVO`. Também valida rigorosamente se o usuário que solicita a devolução é o dono legítimo do livro.
- **Lógica de Atraso (RN05 e RN06)**: Compara a data de hoje com a `dataRetornoPrevista`. Se atrasar, é deduzido `0.5` da reputação do solicitante por dia, garantindo que a nota nunca seja menor que zero.
- **Integração Atômica**: Aciona o método `registerReturnTransaction` do Repositório.
- **Isolamento HTTP Respeitado**: O método não depende e não retorna entidades HTTP (Request/Response). Apenas entrega as chaves atualizadas, cumprindo a Regra Estrita.


# Evidências da Implementação FASE GREEN - UC03-4

## Testes 

Comando utilizado: 

pnpm start:dev

## Resultado (GREEN)

O teste 1 deve retornar OK, e os demais o determminado erro

## REGISTROS

### PUT {{baseUrl}}/loans/1/return

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 107
ETag: W/"6b-zWHrMoHC8Nr1xewqteWU5R8Dhv4"
Date: Wed, 20 May 2026 17:19:48 GMT
Connection: close

{
  "loanId": "11111111-1111-1111-1111-111111111111",
  "statusEmprestimo": "DEVOLVIDO",
  "statusLivro": "DISPONIVEL"
}

### PUT {{baseUrl}}/loans99999999-9999-9999-9999-999999999999/return

HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 79
ETag: W/"4f-/VFUloiOwRVesBFat0Xtj0h7fhU"
Date: Wed, 20 May 2026 17:20:06 GMT
Connection: close

{
  "message": "Empréstimo não encontrado.",
  "error": "Not Found",
  "statusCode": 404
}

### PUT {{baseUrl}}/loans22222222-2222-2222-2222-222222222222/return

HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 82
ETag: W/"52-wjTpm2CqQ9n/zSFAvenz7et8LKk"
Date: Wed, 20 May 2026 17:20:54 GMT
Connection: close

{
  "message": "Usuário não é dono do livro.",
  "error": "Forbidden",
  "statusCode": 403
}

## Link do PR