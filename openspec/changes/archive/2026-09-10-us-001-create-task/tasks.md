## 1. Camada de Domínio

- [x] 1.1 Criar enum `TaskStatus` em `src/domain/constants/task-status.enum.ts` com os valores `PENDING`, `IN_PROGRESS`, `DONE`
- [x] 1.2 Implementar a entidade rica `Task` em `src/domain/model/task.model.ts` com auto-validação de título (3-100 caracteres), descrição (máximo 2000 caracteres) e status
- [x] 1.3 Criar suíte de testes unitários da entidade `Task` em `src/domain/model/task.model.spec.ts` cobrindo 100% das invariantes
- [x] 1.4 Criar port `TaskRepository` e o token de injeção `TASK_REPOSITORY` em `src/domain/port/repositories/task.repository.interface.ts`
- [x] 1.5 Implementar `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.ts`
- [x] 1.6 Criar testes unitários para `CreateTaskUseCase` em `src/domain/usecase/create-task.usecase.spec.ts` cobrindo sucesso, aborto de efeitos colaterais e propagação de erro

## 2. Camada de Persistência (Drizzle ORM)

- [x] 2.1 Definir a tabela `tasks` e enum `task_status` no schema Drizzle em `src/adapters/database/drizzle/schema.ts`
- [x] 2.2 Implementar `DrizzleTaskRepository` em `src/adapters/repositories/drizzle-task.repository.ts` implementando o port `TaskRepository`
- [x] 2.3 Criar testes unitários para `DrizzleTaskRepository` em `src/adapters/repositories/drizzle-task.repository.spec.ts`

## 3. Camada de Borda HTTP e Módulos

- [x] 3.1 Criar DTOs `CreateTaskDto` e `TaskResponseDto` em `src/adapters/api/dto/` com validações `class-validator` e Swagger
- [x] 3.2 Implementar `TasksController` em `src/adapters/api/controllers/tasks.controller.ts` expondo `POST /tasks`
- [x] 3.3 Criar testes unitários para `TasksController` em `src/adapters/api/controllers/tasks.controller.spec.ts`
- [x] 3.4 Criar `TasksModule` em `src/adapters/modules/tasks.module.ts` configurando controller, use case e repositório
- [x] 3.5 Registrar `TasksModule` e `ValidationPipe` global (via `APP_PIPE`) em `src/app.module.ts`

## 4. Testes e Validação Integrada

- [x] 4.1 Criar testes E2E em `tests/e2e/create-task.e2e-spec.ts` cobrindo criação com sucesso (201), título inválido (400), status inválido (400) e autenticação (401/403)
- [x] 4.2 Executar testes unitários e E2E (`pnpm test`) e verificar build (`pnpm build`)
