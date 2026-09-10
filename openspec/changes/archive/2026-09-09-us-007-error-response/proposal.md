## Why

A spec OpenAPI já define o schema `ErrorResponse` e 5 códigos de erro padronizados (Etapa 2 concluída). Agora é necessário implementar o tratamento de erros no código — `DomainException`, `ErrorCode` enum, `AllExceptionsFilter` e `ErrorResponseDto` — para que qualquer exceção seja convertida automaticamente no formato padronizado `{ code, message, details? }`.

## What Changes

- Criação do enum `ErrorCode` em `src/domain/constants/error-code.enum.ts` com os 5 códigos definidos na spec
- Criação de `DomainException` em `src/domain/exception/domain.exception.ts` — exceção de domínio com `code` e `httpStatus`
- Criação de `ErrorResponseDto` em `src/shared/dto/error-response.dto.ts` — DTO que espelha o schema da spec
- Criação de `AllExceptionsFilter` em `src/adapters/api/filters/all-exceptions.filter.ts` — catch-all global com 3 camadas (DomainException, HttpException, genérica)
- Registro do filter como `APP_FILTER` global em `src/app.module.ts`
- 12 testes unitários cobrindo os 3 tipos de exceção e edge cases

## Capabilities

### New Capabilities

Nenhuma — a change implementa código contra a spec `error-handling` já existente.

### Modified Capabilities

Nenhuma — os requisitos da spec `error-handling` não mudam; esta change apenas os implementa.

## Impact

- **Domínio**: Novo enum `ErrorCode` e `DomainException` — base para todas as etapas seguintes (US-006 guard, US-001–005 CRUD)
- **API**: Todas as respostas de erro passam a seguir o formato `ErrorResponse` automaticamente
- **app.module.ts**: Adição de `APP_FILTER` provider
- **Testes**: 12 testes unitários novos
- **Sem breaking changes**: Não altera funcionalidades existentes
