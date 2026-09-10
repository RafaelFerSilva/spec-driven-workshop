## Why

A criação de tarefas é a funcionalidade central de negócio da API, permitindo que usuários autenticados registrem tarefas com título, descrição opcional e status. Esta mudança implementa a US-001 e estabelece os padrões fundamentais de Clean Architecture e Rich Domain Model no projeto.

## What Changes

- Criação do enum `TaskStatus` em `src/domain/constants/task-status.enum.ts` com valores `PENDING`, `IN_PROGRESS`, `DONE`
- Criação da entidade rica `Task` em `src/domain/model/task.model.ts` que auto-valida invariantes no construtor (título de 3 a 100 caracteres, descrição até 2000 caracteres, status válido)
- Criação do port `TaskRepository` em `src/domain/port/repositories/task.repository.interface.ts` com método `create(task: Task): Promise<Task>` e token de DI `TASK_REPOSITORY`
- Criação do caso de uso `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.ts`
- Definição do schema Drizzle da tabela `tasks` e enum `task_status` em `src/adapters/database/drizzle/schema.ts`
- Implementação do repositório `DrizzleTaskRepository` em `src/adapters/repositories/drizzle-task.repository.ts`
- Criação dos DTOs `CreateTaskDto` e `TaskResponseDto` em `src/adapters/api/dto/` com decorators do `class-validator` e `@nestjs/swagger`
- Criação do `TasksController` em `src/adapters/api/controllers/tasks.controller.ts` expondo o endpoint `POST /tasks` (sob o prefixo global `/api`)
- Criação do `TasksModule` em `src/adapters/modules/tasks.module.ts` e importação no `AppModule`
- Registro do `ValidationPipe` global no `AppModule` via `APP_PIPE`
- Testes unitários para `Task` (100% de cobertura das regras de negócio), `CreateTaskUseCase`, `TasksController` e `DrizzleTaskRepository`
- Testes E2E em `tests/e2e/create-task.e2e-spec.ts`

## Capabilities

### New Capabilities

Nenhuma — a capability `task-crud` já existe nas specs principais.

### Modified Capabilities

- `task-crud`: Refina os requisitos da criação de tarefas detalhando as regras do Rich Domain Model (auto-validação e interrupção de efeitos colaterais) e a resposta estruturada.

## Impact

- **Persistência**: Criação da tabela `tasks` no PostgreSQL via Drizzle ORM.
- **Borda HTTP**: Exposição da rota `POST /api/tasks` protegida por padrão pelo `ApiKeyGuard`.
- **Validação Global**: Ativação do `ValidationPipe` global para toda a aplicação.
- **Domínio**: Estabelece o padrão de Rich Domain Model e ports para as etapas seguintes do CRUD (US-002 a US-005).
