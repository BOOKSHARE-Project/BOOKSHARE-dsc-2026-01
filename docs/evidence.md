# Evidências da Implementação FASE RED


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



# Evidências da Implementação Do Repositorio

**Isolamento da Camada de Dados**: Foi adicionada a função `registerReturnTransaction` na interface e na implementação do repositório de empréstimos (`LoansTypeOrmRepository`).
- **Transação Atômica**: Utilização do `QueryRunner` do TypeORM para garantir que todas as atualizações no banco de dados sejam feitas de forma segura e conjunta.
- **Tabelas Afetadas**: A função atualiza atomicamente o status do Empréstimo para `DEVOLVIDO`, o status do Livro para `DISPONIVEL` e, opcionalmente, atualiza a pontuação (`reputacao`) do Usuário se houver atraso.
- **Regras Respeitadas**: Toda regra de cálculo de dias ou validação HTTP ficou de fora, focando 100% na persistência atômica

## Link do PR

