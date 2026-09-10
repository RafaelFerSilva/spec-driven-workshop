## Why

O projeto possui 7 User Stories documentadas e a base técnica NestJS configurada, mas não existe um contrato formal da API. Sem a spec OpenAPI, o time não tem fonte de verdade para validação, geração de Swagger, ou alinhamento PO/QA/dev. A Etapa 2 do workshop define que o contrato vem **antes** do código de negócio — spec-first.

## What Changes

- Criação do arquivo `openapi.yaml` na raiz do projeto com a spec OpenAPI 3.0.3 completa do MVP
- Definição de 6 schemas: `Task`, `CreateTaskInput`, `UpdateTaskInput`, `ErrorResponse`, `PaginatedTasksResponse`, `TaskStatus`
- Definição de segurança global via `ApiKeyAuth` (header `x-api-key`)
- Definição de 5 paths com rastreabilidade `x-us-id`:
  - `POST /api/tasks` (US-001)
  - `GET /api/tasks` (US-002)
  - `GET /api/tasks/{id}` (US-003)
  - `PATCH /api/tasks/{id}` (US-004)
  - `DELETE /api/tasks/{id}` (US-005)
- Documentação de todos os status codes (sucesso + erro) com exemplos concretos
- Referência a `ErrorResponse` em todas as respostas 4xx/5xx (US-007)

## Capabilities

### New Capabilities

- `task-crud`: CRUD completo de tarefas — criação (US-001), listagem paginada (US-002), consulta por ID (US-003), atualização parcial (US-004) e remoção via soft delete (US-005)
- `api-key-auth`: Autenticação mínima via API Key no header `x-api-key` — proteção global de todos os endpoints (US-006)
- `error-handling`: Respostas de erro padronizadas com schema `ErrorResponse` contendo `code`, `message` e `details` opcional (US-007)

### Modified Capabilities

Nenhuma — não existem specs anteriores.

## Impact

- **API**: Define o contrato completo da API REST com 5 endpoints, schemas de entrada/saída e segurança
- **Documentação**: O Swagger em `/api/docs` passará a refletir a spec como fonte de verdade
- **Implementação futura**: As etapas 3–9 do workshop implementarão código contra esta spec — qualquer contradição é bug
- **Sem impacto em código existente**: Esta change cria apenas documentação (arquivo `openapi.yaml`), sem alterações em `src/`
