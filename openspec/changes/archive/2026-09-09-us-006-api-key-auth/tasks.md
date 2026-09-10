## 1. Implementação do Decorator e Guard

- [x] 1.1 Criar o decorator `@Public()` e a constante `IS_PUBLIC_KEY` em `src/adapters/api/guards/public.decorator.ts`
- [x] 1.2 Implementar `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.ts` com validação de `@Public()`, extração do header `x-api-key`, e lançamento de `DomainException(UNAUTHORIZED, 401)` e `DomainException(INVALID_API_KEY, 403)`
- [x] 1.3 Registrar `ApiKeyGuard` globalmente no `AppModule` em `src/app.module.ts` via provider `APP_GUARD`

## 2. Testes Unitários e Validação

- [x] 2.1 Criar suíte de testes unitários para `ApiKeyGuard` em `src/adapters/api/guards/api-key.guard.spec.ts` cobrindo rota pública, chave válida, chave ausente (401) e chave inválida (403)
- [x] 2.2 Executar testes unitários com `pnpm test` e verificar compilação com `pnpm build`
