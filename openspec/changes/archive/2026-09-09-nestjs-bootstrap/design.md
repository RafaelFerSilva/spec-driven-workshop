## Context

O repositório `spec-driven-workshop` contém apenas documentação: 7 User Stories, um documento de arquitetura e um tutorial de workshop. Não existe código-fonte, configuração de build, nem infraestrutura. Este design descreve como criar a base técnica que permite a implementação das USs.

A stack alvo está definida em `docs/architecture.md` e as decisões abaixo seguem esse documento como referência normativa.

## Goals / Non-Goals

**Goals:**
- Projeto NestJS 12 + Fastify 5 compilando e executando com `pnpm dev`
- Estrutura de diretórios Clean Architecture (`domain/`, `adapters/`, `shared/`) criada e vazia
- TypeScript strict com path aliases configurados e resolvidos no build e nos testes
- Vitest com 3 perfis (unit, integration, e2e) executando com sucesso
- ESLint flat config + Prettier com as convenções do projeto (sem `;`, aspas simples, 120 cols)
- Docker Compose com PostgreSQL 15-alpine acessível localmente
- Drizzle ORM configurado com módulo NestJS e script de migrate
- Swagger acessível em `/api/docs`
- Logger estruturado via `nestjs-pino`
- Build via SWC (`unplugin-swc`) funcional
- `pnpm lint && pnpm build && pnpm test` passando sem erros

**Non-Goals:**
- Implementar qualquer endpoint, entidade, use case ou controller
- Criar schema de banco (tabelas, enums) — isso pertence à US-001
- Configurar CI/CD ou pipelines de deploy
- Implementar autenticação (US-006) ou tratamento de erros (US-007)
- Configurar Playwright — pertence à etapa de testes de jornada

## Decisions

### D-001: NestJS 12 + Fastify 5 (vs Express)

**Escolha**: Fastify 5 via `@nestjs/platform-fastify`.

**Alternativas**: Express (default do NestJS).

**Racional**: Fastify é significativamente mais rápido em throughput, tem melhor suporte a JSON Schema nativo, e é a recomendação do documento de arquitetura. A integração com NestJS 12 é first-class via `FastifyAdapter`.

**Impacto**: O `main.ts` usa `NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())`. Swagger usa `@fastify/swagger` em vez de `swagger-ui-express`.

### D-002: Estrutura Clean Architecture

**Escolha**: 3 camadas em `src/` — `domain/`, `adapters/`, `shared/`.

```
src/
├── domain/                  ← Puro TypeScript, sem imports de framework
│   ├── model/
│   ├── exception/
│   ├── port/repositories/
│   ├── usecase/
│   ├── constants/
│   └── validators/
├── adapters/                ← Implementações concretas
│   ├── api/controllers/
│   ├── api/dto/
│   ├── api/filters/
│   ├── api/guards/
│   ├── api/pipes/
│   ├── api/interceptors/
│   ├── database/drizzle/
│   ├── modules/
│   └── repositories/
└── shared/                  ← DTOs agnósticos, utilitários
```

**Racional**: Segue exatamente o documento de arquitetura. A regra de dependência é unidirecional: `adapters` → `domain` ← `shared`. O domínio nunca importa framework.

### D-003: Path Aliases

**Escolha**: 5 aliases em `tsconfig.json`:

| Alias | Caminho |
|-------|---------|
| `@domain/*` | `src/domain/*` |
| `@adapters/*` | `src/adapters/*` |
| `@shared/*` | `src/shared/*` |
| `@src/*` | `src/*` |
| `@tests/*` | `tests/*` |

**Racional**: Evita imports relativos profundos (`../../../`). Requer configuração no Vitest (`resolve.alias`) e no SWC para funcionar em build e testes.

### D-004: Vitest com 3 Perfis

**Escolha**: 3 arquivos de config separados:
- `vitest.unit.ts` — testes `*.spec.ts` colocalizados em `src/`
- `vitest.integration.ts` — testes `*.integration.spec.ts` em `tests/integration/`
- `vitest.e2e.ts` — testes `*.e2e-spec.ts` em `tests/e2e/`

**Scripts**:
- `pnpm test` → unitários
- `pnpm test:e2e` → e2e com Supertest
- `pnpm test:cov` → unitários com cobertura

**Racional**: Separação evita que testes de integração/e2e (que precisam de banco ou servidor) rodem acidentalmente nos unitários.

### D-005: SWC via unplugin-swc

**Escolha**: SWC para build e para transpilação nos testes (via `unplugin-swc/vite`).

**Racional**: SWC é ~20x mais rápido que `tsc` para transpilação. O `.swcrc` configura decorators e metadata para compatibilidade com NestJS.

### D-006: Drizzle ORM + Módulo NestJS

**Escolha**: Drizzle ORM com `drizzle-orm/node-postgres` e `pg` como driver.

**Configuração**:
- `drizzle.config.ts` apontando para o schema em `src/adapters/database/drizzle/schema.ts`
- Módulo NestJS `DrizzleModule` registrado como global, injetando o client via `DRIZZLE` token
- Migrações em `drizzle/` na raiz

**Racional**: Drizzle é type-safe, leve e permite SQL explícito quando necessário. O módulo global evita importações repetidas.

### D-007: Docker Compose para PostgreSQL

**Escolha**: `docker-compose.yml` com `postgres:15-alpine`.

```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: taskmanager
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
```

**Racional**: Banco local idêntico ao de produção. Alpine mantém a imagem leve.

### D-008: Swagger com Fastify

**Escolha**: `@nestjs/swagger` + `@fastify/swagger` + `@fastify/swagger-ui`, endpoint em `/api/docs`.

**Racional**: Documentação viva da API, acessível para PO e QA. O prefixo `/api` é padrão do projeto.

## Risks / Trade-offs

- **[Versões de dependência]** → As versões listadas na arquitetura (NestJS 12, Fastify 5, Drizzle 0.45+) são recentes. Fixar versões exatas no `package.json` e testar compatibilidade durante o bootstrap.
- **[Path aliases em runtime]** → Aliases funcionam no TypeScript mas precisam ser resolvidos em runtime pelo build SWC. Verificar que `pnpm build && node dist/main.js` resolve corretamente.
- **[PostgreSQL obrigatório]** → Testes de integração e e2e precisam do banco. Mitigação: Docker Compose garante disponibilidade local; testes unitários rodam sem banco.
- **[SWC + decorators]** → SWC exige `.swcrc` com `legacyDecorator: true` e `emitDecoratorMetadata: true` para compatibilidade com NestJS. Validar na primeira execução.
