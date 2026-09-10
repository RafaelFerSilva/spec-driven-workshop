## Context

O projeto conta com a infraestrutura base (Etapa 1), a especificação OpenAPI completa (Etapa 2), o tratamento uniforme de erros com `AllExceptionsFilter` (Etapa 3) e a autenticação global via `ApiKeyGuard` (Etapa 4).

Esta é a Etapa 5 do workshop: a primeira história de usuário de negócio (US-001 — Criar tarefa). Ela estabelece a espinha dorsal de Clean Architecture e o padrão de Rich Domain Model (modelo não-anêmico) que norteará todo o restante do desenvolvimento.

## Goals / Non-Goals

**Goals:**
- Implementar a entidade de domínio `Task` como um Rich Domain Model com auto-validação de invariantes
- Implementar o port `TaskRepository` e o caso de uso `CreateTaskUseCase`
- Garantir a interrupção de efeitos colaterais em dados inválidos e propagação de falhas de dependência
- Criar a tabela `tasks` no Drizzle ORM e implementar o `DrizzleTaskRepository`
- Expor o endpoint `POST /api/tasks` através de `TasksController` com `CreateTaskDto` e `TaskResponseDto`
- Ativar o `ValidationPipe` global no `AppModule` via `APP_PIPE`
- Cobrir 100% das invariantes em testes unitários colocalizados e implementar testes E2E

**Non-Goals:**
- Implementar endpoints de busca por ID (US-003), listagem paginada (US-002), atualização (US-004) ou soft delete (US-005)
- Operações em lote de criação de tarefas

## Decisions

### D-001: Rich Domain Model (Entidade Não-Anêmica)

**Escolha**: A classe `Task` em `src/domain/model/task.model.ts` encapsula seu estado e valida suas regras no construtor através de métodos privados (`validateTitle`, `validateDescription`, `validateStatus`), disparando `DomainException(ErrorCode.VALIDATION_ERROR, ..., 400)`.

**Alternativas**: Modelos anêmicos (interfaces ou classes de dados vazias) validadas apenas no DTO da borda HTTP.

**Racional**: A spec e os DTOs blindam a borda HTTP, mas o domínio deve se auto-defender. Modelos anêmicos permitem que objetos existam em estado inválido na aplicação. O Rich Domain Model garante integridade contínua e testabilidade pura sem necessidade de inicializar o framework.

### D-002: Inversão de Dependência com Port Interface e Injection Token

**Escolha**: O `CreateTaskUseCase` depende exclusivamente do contrato `TaskRepository` (`src/domain/port/repositories/task.repository.interface.ts`). A injeção no NestJS é feita através do token `TASK_REPOSITORY = Symbol('TASK_REPOSITORY')` com `@Inject(TASK_REPOSITORY)`.

**Alternativas**: Injetar `DrizzleTaskRepository` diretamente na camada de aplicação.

**Racional**: Preserva a regra de dependência da Clean Architecture — o domínio não conhece detalhes de tecnologia externa (PostgreSQL / Drizzle ORM). Testes unitários do use case tornam-se simples e rápidos com mocks em memória.

### D-003: Geração de IDs via UUID v4 pelo Domínio

**Escolha**: Gerar o identificador único da tarefa via `crypto.randomUUID()` na criação da entidade, permitindo também receber um `id` existente para reconstituição da entidade vinda do banco de dados.

**Alternativas**: IDs sequenciais (`serial`) gerados pelo PostgreSQL após o insert.

**Racional**: O identificador se torna parte da identidade da entidade antes mesmo de ser persistida. Evita dependência de chamadas adicionais de sequência e alinha com a spec OpenAPI que define `id: UUID`.

### D-004: Dupla Blindagem com ValidationPipe Global

**Escolha**: Registrar `ValidationPipe({ whitelist: true, transform: true })` globalmente via `APP_PIPE` no `AppModule`, utilizando `class-validator` nos DTOs (`@MinLength(3)`, `@MaxLength(100)`, `@IsEnum(TaskStatus)`).

**Alternativas**: Validar apenas no DTO ou apenas no domínio.

**Racional**: Dupla blindagem. O `ValidationPipe` barra requisições HTTP malformadas antes de processar a rota, fornecendo detalhes amigáveis (`details`) via `AllExceptionsFilter`. Ao mesmo tempo, a entidade `Task` garante que qualquer criação programática fora da borda HTTP respeite as mesmas regras.

## Risks / Trade-offs

- **[Duplicação das regras de validação (DTO vs Entidade)]** → As regras (ex.: tamanho de 3 a 100 caracteres) são expressas no DTO (anotações `class-validator`) e no método privado da entidade. Mitigação: O DTO cuida da serialização HTTP, e a entidade protege as invariantes centrais de negócio.
- **[Migrações em banco de dados]** → O schema precisa existir na instância do PostgreSQL. Mitigação: Execução de migrações ou geração de tabela via Drizzle ORM garantindo idempotência.
