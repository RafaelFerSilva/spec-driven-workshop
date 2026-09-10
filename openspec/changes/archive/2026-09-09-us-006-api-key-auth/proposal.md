## Why

A API de tarefas precisa de proteção global de segurança via API Key sem a complexidade de mecanismos avançados de autenticação no MVP. Esta mudança implementa o padrão "Secure by Default" através de um guard global que protege todos os endpoints automaticamente, permitindo exceções controladas via decorator `@Public()`.

## What Changes

- Criação do decorator `@Public()` em `src/adapters/api/guards/public.decorator.ts` utilizando metadados do NestJS via `SetMetadata`
- Implementação de `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.ts` validando o header `x-api-key` contra o `API_KEY` injetado pelo `ConfigService`
- Lançamento de `DomainException(ErrorCode.UNAUTHORIZED, ..., 401)` quando o header `x-api-key` estiver ausente
- Lançamento de `DomainException(ErrorCode.INVALID_API_KEY, ..., 403)` quando o header `x-api-key` for inválido
- Registro do `ApiKeyGuard` como `APP_GUARD` global em `src/app.module.ts`
- 4 testes unitários cobrindo rota pública, chave válida, chave ausente e chave inválida

## Capabilities

### New Capabilities

Nenhuma — a capability `api-key-auth` já existe nas specs principais.

### Modified Capabilities

- `api-key-auth`: Refina os requisitos para cobrir a execução do `ApiKeyGuard` global e o bypass explícito via `@Public()`.

## Impact

- **Segurança**: Toda a API passa a ser protegida por padrão. Qualquer controller futuro já nasce seguro.
- **Exceptions**: Integração direta com `DomainException` e `AllExceptionsFilter` (Etapa 3) gerando respostas no schema `ErrorResponse`.
- **app.module.ts**: Adição de `APP_GUARD` provider.
- **Sem breaking changes**: As variáveis de ambiente `.env` e `.env.example` já contêm `API_KEY`.
