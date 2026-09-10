## Context

O projeto possui a spec OpenAPI completa com `ErrorResponse` definido (Etapa 2 arquivada) e a base NestJS configurada (Etapa 1 arquivada). Nenhum código de negócio existe em `src/` ainda — os diretórios `domain/exception`, `domain/constants`, `shared/dto` e `adapters/api/filters` estão vazios (`.gitkeep`).

Esta é a Etapa 3 do workshop — a primeira a adicionar código de aplicação. O `AllExceptionsFilter` é cross-cutting e afeta toda a API, por isso é implementado antes de qualquer endpoint.

## Goals / Non-Goals

**Goals:**
- Implementar `ErrorCode` enum alinhado com os 5 códigos da spec OpenAPI
- Implementar `DomainException` como exceção base do domínio (sem dependência de NestJS)
- Implementar `ErrorResponseDto` espelhando o schema `ErrorResponse` da spec
- Implementar `AllExceptionsFilter` tratando 3 camadas: `DomainException`, `HttpException`, genérica
- Registrar filter globalmente via `APP_FILTER`
- 12 testes unitários cobrindo todos os cenários

**Non-Goals:**
- Implementar o `ApiKeyGuard` (Etapa 4)
- Criar endpoints de tarefas (Etapas 5–9)
- Implementar validação de DTOs com `class-validator` (pertence à Etapa 5)

## Decisions

### D-001: DomainException no domínio (vs HttpException do NestJS)

**Escolha**: `DomainException` em `src/domain/exception/` — exceção pura sem dependência de `@nestjs/common`.

**Alternativas**: Usar `HttpException` diretamente nas camadas de domínio.

**Racional**: O domínio não deve depender de framework. `DomainException` carrega `code` (ErrorCode) e `httpStatus` (número), permitindo que o filter traduza para HTTP sem que o domínio conheça NestJS. Isso segue o padrão Clean Architecture do workshop.

### D-002: ErrorCode como const enum (vs string literals)

**Escolha**: Enum TypeScript em `src/domain/constants/error-code.enum.ts` com valores string UPPER_SNAKE_CASE.

**Alternativas**: Union type de string literals.

**Racional**: Enum oferece auto-complete, refactoring seguro e correspondência 1:1 com os códigos da spec OpenAPI. Os valores são strings para serialização direta no JSON de resposta.

### D-003: AllExceptionsFilter com 3 camadas

**Escolha**: Um único filter global que trata `DomainException` → `HttpException` → `Error` genérico, nessa ordem de prioridade.

**Alternativas**: Múltiplos filters (um para cada tipo de exceção).

**Racional**: Um único catch-all garante que **nenhuma** exceção escape sem o formato padronizado. A ordem de checagem (instanceof) define a prioridade: exceções de domínio têm semântica mais rica que HttpException genérica.

### D-004: Registro via APP_FILTER (vs @UseFilters no controller)

**Escolha**: `{ provide: APP_FILTER, useClass: AllExceptionsFilter }` no `providers` do `AppModule`.

**Alternativas**: `app.useGlobalFilters()` no `main.ts` ou `@UseFilters()` por controller.

**Racional**: `APP_FILTER` permite injeção de dependências no filter (necessário para acessar `HttpAdapterHost`). O registro global garante cobertura automática de qualquer endpoint futuro.

### D-005: Extração de details de HttpException

**Escolha**: Quando `HttpException.getResponse()` retorna um objeto com `message` array (padrão do ValidationPipe do NestJS), extrair como `details` no `ErrorResponse`.

**Racional**: O NestJS ValidationPipe retorna `{ message: string[], error: string, statusCode: number }`. Transformar `message[]` em `details[]` com formato `{ field?, message }` permite compatibilidade com a spec sem perder informação de validação.

## Risks / Trade-offs

- **[Dependência de HttpAdapterHost]** → O `AllExceptionsFilter` usa `HttpAdapterHost` para acessar o adapter HTTP (Fastify). Isso é necessário porque `@Catch()` sem parâmetro captura exceções fora do ciclo de request-response do NestJS. Mitigação: é o padrão oficial do NestJS para exception filters globais.
- **[ErrorCode incompleto]** → Se etapas futuras adicionarem novos códigos de erro, o enum precisará ser estendido. Mitigação: enum é facilmente extensível sem breaking changes.
