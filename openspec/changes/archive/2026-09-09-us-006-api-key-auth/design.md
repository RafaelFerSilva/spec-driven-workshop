## Context

O projeto conta com a base NestJS (Etapa 1), a especificação OpenAPI completa (Etapa 2) e o tratamento de erros padronizado com `AllExceptionsFilter` e `DomainException` (Etapa 3). Esta é a Etapa 4 do workshop, responsável por implementar a autenticação mínima via API Key.

Atualmente, `src/adapters/api/guards/` contém apenas um `.gitkeep`, e `.env` possui `API_KEY=my-dev-api-key-123`.

## Goals / Non-Goals

**Goals:**
- Implementar o padrão *Secure by Default* protegendo todos os endpoints da API automaticamente
- Criar o decorator `@Public()` para permitir bypass explícito em rotas públicas (ex.: documentação Swagger)
- Implementar `ApiKeyGuard` com injeção de `Reflector` e `ConfigService`
- Lançar `DomainException(UNAUTHORIZED, ..., 401)` quando a chave estiver ausente
- Lançar `DomainException(INVALID_API_KEY, ..., 403)` quando a chave for incorreta
- Registrar o guard globalmente no `AppModule` via `APP_GUARD`
- Criar suíte de 4 testes unitários cobrindo todos os cenários

**Non-Goals:**
- Implementar autenticação multi-usuário, JWT ou OAuth2 (fora do escopo do MVP)
- Armazenamento de API keys em banco de dados ou rotação dinâmica de chaves
- Criar controllers ou endpoints de negócio (pertencem às Etapas 5–9)

## Decisions

### D-001: Secure by Default via APP_GUARD

**Escolha**: Registrar `ApiKeyGuard` como provider global usando o token `APP_GUARD` no `AppModule`.

**Alternativas**: Aplicar `@UseGuards(ApiKeyGuard)` individualmente em cada controller ou rota.

**Racional**: A abordagem *Secure by Default* elimina o risco de novos endpoints ficarem acidentalmente expostos. Se um novo controller for adicionado sem anotação, ele já nasce protegido. A única forma de tornar uma rota pública é através de uma declaração explícita com `@Public()`.

### D-002: Decorator @Public() com Reflector

**Escolha**: Criar decorator customizado `@Public()` que define o metadado `isPublic = true` usando `SetMetadata`. No guard, extrair o metadado via `reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])`.

**Alternativas**: Manter lista fixa de URLs públicas (hardcoded) dentro do Guard.

**Racional**: Decorators colocalizados nos métodos/controllers tornam a intenção clara e auditável no próprio código da rota, além de suportar decorators tanto em nível de método quanto de classe.

### D-003: Injeção de ConfigService para leitura da API_KEY

**Escolha**: Injetar `ConfigService` no `ApiKeyGuard` para ler a chave configurada via `configService.get<string>('API_KEY')`.

**Alternativas**: Acessar `process.env.API_KEY` diretamente.

**Racional**: O uso de `ConfigService` isola o acesso a variáveis de ambiente, segue as melhores práticas do NestJS e facilita a injeção de mocks durante os testes unitários.

### D-004: Lançamento de DomainException (401 ausente, 403 inválida)

**Escolha**: Lançar `DomainException(ErrorCode.UNAUTHORIZED, 'API key is required', 401)` e `DomainException(ErrorCode.INVALID_API_KEY, 'API key is invalid', 403)`.

**Alternativas**: Lançar `UnauthorizedException` ou `ForbiddenException` nativas do NestJS.

**Racional**: Conforme especificado na spec OpenAPI e no `api-key-auth/spec.md`, a chave ausente deve retornar 401 (`UNAUTHORIZED`) e a chave inválida 403 (`INVALID_API_KEY`). O `AllExceptionsFilter` (implementado na Etapa 3) já intercepta `DomainException` e produz o JSON `ErrorResponse` exatamente como exige o contrato.

## Risks / Trade-offs

- **[Chave estática compartilhada]** → O MVP utiliza uma chave única estática em variável de ambiente. Em produção real, chaves costumam ser hashed em banco e pertencer a tenants. Mitigação: para fins do workshop spec-driven, cumpre 100% o contrato de validação do header.
- **[Sensibilidade de case no header]** → O Node.js/Fastify normaliza todos os headers HTTP para lowercase (`x-api-key`). Mitigação: acessar `request.headers['x-api-key']` garante compatibilidade nativa.
