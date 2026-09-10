# task-crud Specification

## Purpose

CRUD completo de tarefas — criação, listagem paginada, consulta por ID, atualização parcial e remoção via soft delete. Cobre US-001 a US-005.

## Requirements

### Requirement: Criar tarefa
O sistema SHALL expor um endpoint `POST /api/tasks` que cria uma tarefa com título, descrição opcional e status. A entidade `Task` MUST validar suas invariantes no construtor (Rich Domain Model), interrompendo a execução sem tocar a persistência caso os dados sejam inválidos. A spec OpenAPI MUST definir o schema `CreateTaskInput` com as constraints de validação e o schema `Task` como resposta.

#### Scenario: Criação com dados válidos
- **WHEN** o consumidor envia `POST /api/tasks` com `title` de 3–100 caracteres
- **THEN** o sistema retorna HTTP 201 com a tarefa criada contendo `id` (UUID), `title`, `description`, `status`, `createdAt` e `updatedAt`

#### Scenario: Criação sem status (default PENDING)
- **WHEN** o consumidor envia `POST /api/tasks` sem campo `status`
- **THEN** o sistema cria a tarefa com `status` = `PENDING`

#### Scenario: Validação de título curto
- **WHEN** o consumidor envia `POST /api/tasks` com `title` menor que 3 caracteres
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse` contendo `code` = `VALIDATION_ERROR`

#### Scenario: Validação de descrição muito longa
- **WHEN** o consumidor envia `POST /api/tasks` com `description` excedendo 2000 caracteres
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse` contendo `code` = `VALIDATION_ERROR`

#### Scenario: Status inválido
- **WHEN** o consumidor envia `POST /api/tasks` com `status` fora do enum `PENDING | IN_PROGRESS | DONE`
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse` contendo `code` = `VALIDATION_ERROR`

#### Scenario: Interrupção de efeitos colaterais em dados inválidos
- **WHEN** os dados de criação forem rejeitados pelas invariantes da entidade de domínio
- **THEN** o caso de uso aborta a operação e o repositório de persistência não é invocado

### Requirement: Listar tarefas com paginação
O sistema SHALL expor um endpoint `GET /api/tasks` com paginação 0-based. A spec OpenAPI MUST definir os query params `page` e `pageSize` e o schema `PaginatedTasksResponse`.

#### Scenario: Listagem com parâmetros default
- **WHEN** o consumidor envia `GET /api/tasks` sem query params
- **THEN** o sistema retorna HTTP 200 com `items` (array de `Task`), `total`, `page` = 0 e `pageSize` = 10

#### Scenario: Listagem com paginação explícita
- **WHEN** o consumidor envia `GET /api/tasks?page=2&pageSize=5`
- **THEN** o sistema retorna HTTP 200 com a página 2 de 5 itens, `total` refletindo o total global

#### Scenario: pageSize acima do máximo
- **WHEN** o consumidor envia `GET /api/tasks` com `pageSize` > 100
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse` contendo `code` = `VALIDATION_ERROR`

#### Scenario: Tarefas soft-deleted não aparecem
- **WHEN** uma tarefa possui `deletedAt` preenchido
- **THEN** essa tarefa não aparece nos resultados de `GET /api/tasks`

### Requirement: Consultar tarefa por ID
O sistema SHALL expor um endpoint `GET /api/tasks/{id}` que retorna os detalhes de uma tarefa específica.

#### Scenario: Consulta com ID válido existente
- **WHEN** o consumidor envia `GET /api/tasks/{id}` com UUID de tarefa existente e não removida
- **THEN** o sistema retorna HTTP 200 com `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`

#### Scenario: Tarefa não encontrada
- **WHEN** o consumidor envia `GET /api/tasks/{id}` com UUID inexistente ou soft-deleted
- **THEN** o sistema retorna HTTP 404 com `ErrorResponse` contendo `code` = `TASK_NOT_FOUND`

#### Scenario: ID com formato inválido
- **WHEN** o consumidor envia `GET /api/tasks/{id}` com valor que não é UUID válido
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse`

### Requirement: Atualizar tarefa parcialmente
O sistema SHALL expor um endpoint `PATCH /api/tasks/{id}` que atualiza parcialmente uma tarefa existente. A spec OpenAPI MUST definir o schema `UpdateTaskInput` com todos os campos opcionais.

#### Scenario: Atualização parcial com sucesso
- **WHEN** o consumidor envia `PATCH /api/tasks/{id}` com um ou mais campos (`title`, `description`, `status`)
- **THEN** o sistema retorna HTTP 200 com a tarefa atualizada e `updatedAt` refletindo o momento da alteração

#### Scenario: Campos não enviados permanecem inalterados
- **WHEN** o consumidor envia `PATCH /api/tasks/{id}` com apenas `status`
- **THEN** `title` e `description` permanecem com valores anteriores

#### Scenario: Validação no PATCH
- **WHEN** o consumidor envia `PATCH /api/tasks/{id}` com `title` de 1 caractere
- **THEN** o sistema retorna HTTP 400 com `ErrorResponse` contendo `code` = `VALIDATION_ERROR`

#### Scenario: Tarefa inexistente
- **WHEN** o consumidor envia `PATCH /api/tasks/{id}` com UUID inexistente ou soft-deleted
- **THEN** o sistema retorna HTTP 404 com `ErrorResponse` contendo `code` = `TASK_NOT_FOUND`

### Requirement: Remover tarefa via soft delete
O sistema SHALL expor um endpoint `DELETE /api/tasks/{id}` que marca a tarefa como removida (soft delete com campo `deletedAt`). A spec OpenAPI MUST documentar que a remoção é lógica.

#### Scenario: Remoção com sucesso
- **WHEN** o consumidor envia `DELETE /api/tasks/{id}` com UUID de tarefa existente e não removida
- **THEN** o sistema retorna HTTP 204 (No Content) e a tarefa recebe `deletedAt` com timestamp atual

#### Scenario: Tarefa já removida ou inexistente
- **WHEN** o consumidor envia `DELETE /api/tasks/{id}` com UUID inexistente ou já soft-deleted
- **THEN** o sistema retorna HTTP 404 com `ErrorResponse` contendo `code` = `TASK_NOT_FOUND`

### Requirement: Schemas OpenAPI
A spec OpenAPI MUST definir os schemas `Task`, `CreateTaskInput`, `UpdateTaskInput`, `TaskStatus`, `PaginatedTasksResponse` e `ErrorResponse` com constraints de validação (minLength, maxLength, enum, format).

#### Scenario: Schema Task com todos os campos
- **WHEN** a spec OpenAPI é validada
- **THEN** o schema `Task` MUST conter `id` (uuid), `title` (string), `description` (string nullable), `status` (TaskStatus enum), `createdAt` (date-time), `updatedAt` (date-time) e `deletedAt` (date-time nullable)

#### Scenario: TaskStatus enum
- **WHEN** a spec OpenAPI é validada
- **THEN** o enum `TaskStatus` MUST conter exatamente `PENDING`, `IN_PROGRESS` e `DONE`

#### Scenario: Constraints de validação em CreateTaskInput
- **WHEN** a spec OpenAPI é validada
- **THEN** `title` MUST ter `minLength: 3` e `maxLength: 100`, `description` MUST ter `maxLength: 2000` e ser opcional, `status` MUST referenciar `TaskStatus` e ser opcional

### Requirement: Rastreabilidade de User Stories
Cada path na spec OpenAPI MUST incluir a extensão `x-us-id` com o identificador da US de origem para rastreabilidade.

#### Scenario: Paths com x-us-id
- **WHEN** a spec OpenAPI é validada
- **THEN** `POST /api/tasks` contém `x-us-id: US-001`, `GET /api/tasks` contém `x-us-id: US-002`, `GET /api/tasks/{id}` contém `x-us-id: US-003`, `PATCH /api/tasks/{id}` contém `x-us-id: US-004`, `DELETE /api/tasks/{id}` contém `x-us-id: US-005`
