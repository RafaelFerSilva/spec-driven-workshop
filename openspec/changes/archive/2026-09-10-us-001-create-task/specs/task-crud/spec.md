## MODIFIED Requirements

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
