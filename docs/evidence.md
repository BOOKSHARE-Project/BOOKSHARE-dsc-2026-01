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


