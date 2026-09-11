# US-007 – Padronizar respostas de erro da API

**Como** consumidor da API  
**Eu quero** receber respostas de erro padronizadas  
**Para** poder tratar erros de forma consistente no cliente

## Critérios de aceitação

1. Todas as respostas de erro da API devem usar um formato padronizado, por exemplo:

   ```json
   {
     "code": "TASK_NOT_FOUND",
     "message": "Task not found",
     "details": { ... }
   }
   ```

2. A spec deve definir um schema `ErrorResponse` com:
   - `code` (string, obrigatório)
   - `message` (string, obrigatório)
   - `details` (objeto opcional)
3. Exemplos de códigos de erro:
   - `TASK_NOT_FOUND`
   - `VALIDATION_ERROR`
   - `INVALID_API_KEY`
   - `INTERNAL_SERVER_ERROR`
4. Todos os endpoints (`/tasks`, `/tasks/{id}`, etc.) devem referenciar `ErrorResponse` em respostas 4xx/5xx.
5. O time de backend deve manter uma lista legível de possíveis `code` para facilitar integração do frontend/consumidores.

## Notas de negócio

- Isso ajuda a futuras integrações (frontend web/mobile, outros serviços).
- Em versões futuras, podemos categorizar erros (negócio vs infraestrutura).
