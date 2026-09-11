# US-006 – Autenticação mínima via API Key

**Como** consumidor da API  
**Eu quero** acessar os endpoints de tarefas apenas com uma chave de API simples  
**Para** proteger o acesso da API sem complexidade de autenticação avançada no MVP

## Critérios de aceitação

1. Todos os endpoints da feature de Task Management (`/tasks`, `/tasks/{id}`) devem exigir autenticação via API Key.
2. A API Key deve ser enviada no header `x-api-key`.
3. Se a API Key estiver ausente, o servidor deve responder:
   - HTTP 401 (Unauthorized) ou 403 (Forbidden) – decidir qual padrão manter na spec.
4. Se a API Key for inválida ou expirada, responder com:
   - HTTP 403
   - `ErrorResponse` com code e message descritivos (ex.: `INVALID_API_KEY`).
5. A definição da API Key (storage, formato) não precisa ser exposta na spec, apenas o contrato de utilização via header.
6. Em ambiente de desenvolvimento, pode ser usada uma chave estática configurada via variável de ambiente.

## Notas de negócio

- Em futuras versões, podemos evoluir para autenticação JWT, OAuth2 ou outro mecanismo.
- Para o MVP de learning/spec-driven, o objetivo é apenas introduzir `securitySchemes` na spec.
