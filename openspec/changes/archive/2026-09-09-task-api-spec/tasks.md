## 1. Estrutura Base da Spec

- [x] 1.1 Criar arquivo `openapi.yaml` na raiz com metadados (openapi, info, servers) usando OpenAPI 3.0.3
- [x] 1.2 Definir `security` global com `ApiKeyAuth`
- [x] 1.3 Definir `securitySchemes.ApiKeyAuth` em `components` (type: apiKey, in: header, name: x-api-key)

## 2. Schemas de Domínio

- [x] 2.1 Criar schema `TaskStatus` (enum: PENDING, IN_PROGRESS, DONE)
- [x] 2.2 Criar schema `Task` com todos os campos (id uuid, title, description nullable, status, createdAt, updatedAt, deletedAt nullable) e constraints
- [x] 2.3 Criar schema `CreateTaskInput` com title (minLength:3, maxLength:100), description opcional (maxLength:2000) e status opcional (ref TaskStatus)
- [x] 2.4 Criar schema `UpdateTaskInput` com title, description e status — todos opcionais, mesmas constraints de CreateTaskInput

## 3. Schemas de Resposta e Erro

- [x] 3.1 Criar schema `ErrorResponse` com code (string, required), message (string, required) e details (array, optional)
- [x] 3.2 Criar schema `PaginatedTasksResponse` com items (array of Task), total, page e pageSize
- [x] 3.3 Adicionar exemplos concretos em cada schema de erro (VALIDATION_ERROR, TASK_NOT_FOUND, UNAUTHORIZED, INVALID_API_KEY, INTERNAL_SERVER_ERROR)

## 4. Paths — CRUD de Tarefas

- [x] 4.1 Definir `POST /api/tasks` com requestBody (CreateTaskInput), resposta 201 (Task), erros 400/401/403 com exemplos e `x-us-id: US-001`
- [x] 4.2 Definir `GET /api/tasks` com query params page e pageSize, resposta 200 (PaginatedTasksResponse), erros 400/401/403 e `x-us-id: US-002`
- [x] 4.3 Definir `GET /api/tasks/{id}` com param id (uuid), resposta 200 (Task), erros 400/401/403/404 e `x-us-id: US-003`
- [x] 4.4 Definir `PATCH /api/tasks/{id}` com requestBody (UpdateTaskInput), resposta 200 (Task), erros 400/401/403/404 e `x-us-id: US-004`
- [x] 4.5 Definir `DELETE /api/tasks/{id}` com param id (uuid), resposta 204, erros 401/403/404 e `x-us-id: US-005`

## 5. Validação

- [x] 5.1 Validar `openapi.yaml` com ferramenta de linting OpenAPI (e.g., `npx @redocly/cli lint openapi.yaml`)
- [x] 5.2 Verificar checklist da Etapa 2: cada US com path + x-us-id, constraints na spec, todos os status codes documentados, ErrorResponse referenciado em 4xx/5xx, security global
