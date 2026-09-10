# Arquitetura e Padrões Técnicos

Referência técnica do projeto. Define a stack, as camadas arquiteturais, os padrões obrigatórios e o fluxo de trabalho de engenharia.

---

## Stack Técnica

| Componente | Tecnologia | Versão |
|---|---|---|
| Runtime | Node.js | 22+ |
| Package Manager | pnpm | 10+ |
| Framework | NestJS | 12.x |
| HTTP Engine | Fastify (via `@nestjs/platform-fastify`) | 5.x |
| Linguagem | TypeScript (strict mode) | 5.9+ |
| ORM | Drizzle ORM | 0.45+ |
| Banco (produção) | PostgreSQL | 15+ |
| Banco (dev) | PostgreSQL via Docker | 15-alpine |
| Validação | class-validator + class-transformer | — |
| Swagger | @nestjs/swagger + @fastify/swagger | — |
| Logger | nestjs-pino + pino-pretty | — |
| Testes | Vitest + Supertest + Playwright | 4.x / 1.x |
| Lint | ESLint (flat config) + Prettier | — |
| Build | SWC (via `unplugin-swc`) | — |

---

## Clean Architecture — Camadas

```
src/
├── domain/          ← Domínio puro (sem dependências de framework)
├── adapters/        ← Implementações concretas de tecnologia
└── shared/          ← Utilitários e tipos compartilhados
```

### Camada de Domínio (`src/domain/`)

Código TypeScript puro. **Proibido** importar dependências de framework (NestJS, Fastify, Drizzle, etc.).

| Diretório | Conteúdo |
|---|---|
| `model/` | Entidades ricas com validação de invariantes |
| `exception/` | Exceções de domínio (`DomainException`) |
| `port/repositories/` | Interfaces de repositório (contratos) |
| `usecase/` | Casos de uso (regras de negócio) |
| `constants/` | Enums e constantes de domínio |
| `validators/` | Validadores de domínio |

### Camada de Adaptadores (`src/adapters/`)

Implementações concretas que dependem de tecnologia.

| Diretório | Conteúdo |
|---|---|
| `api/controllers/` | Controllers NestJS |
| `api/dto/` | DTOs de entrada/saída com `class-validator` + `@ApiProperty` |
| `api/filters/` | Exception filters (`AllExceptionsFilter`) |
| `api/guards/` | Guards de segurança (`ApiKeyGuard`) |
| `api/pipes/` | Validation pipes |
| `api/interceptors/` | Interceptors |
| `database/drizzle/` | Schema Drizzle, módulo de banco, migrações |
| `modules/` | Módulos NestJS por feature |
| `repositories/` | Implementações de repositório |

### Camada Compartilhada (`src/shared/`)

Utilitários globais, DTOs agnósticos de resposta (`ErrorResponseDto`) e tipagens universais.

---

## Padrões Obrigatórios

### 1. Rich Domain Model (Não Anêmico)

Entidades em `src/domain/model/*.model.ts` **nunca são modelos anêmicos**:

- Toda entidade valida suas próprias regras no construtor ou métodos de negócio (`private validate(props)`).
- Violações de invariantes disparam `DomainException` com o `ErrorCode` apropriado e status HTTP mapeado.
- Toda entidade possui suíte unitária colocalizada `*.model.spec.ts` cobrindo **100% das invariantes e exceções**.

### 2. Propagação de Erros nos Use Cases

Use cases em `src/domain/usecase/*.usecase.ts` nunca mascararam silenciosamente erros:

- **Propagação de falhas de dependência**: Mock rejeitando e asserção de que o use case propaga a exceção.
- **Interrupção de efeitos colaterais**: Ao receber dados inválidos, o repositório **não é invocado**.

### 3. Autenticação Global (Secure by Default)

- `ApiKeyGuard` registrado globalmente via `APP_GUARD`.
- Rotas públicas usam `@Public()` (decorator com `Reflector`).
- Header: `x-api-key`.

### 4. Tratamento de Erros Padronizado

- `AllExceptionsFilter` global captura todas as exceções.
- Formato: `{ code: string, message: string, details?: any[] }`.
- Códigos padronizados: `VALIDATION_ERROR`, `TASK_NOT_FOUND`, `UNAUTHORIZED`, `INVALID_API_KEY`, `INTERNAL_SERVER_ERROR`.

### 5. Schema Drizzle

- IDs como `text` + `crypto.randomUUID()`.
- Timestamps com `precision: 3, mode: 'date'`.
- Soft delete via campo `deletedAt` nullable.
- Enums via `pgEnum` do Drizzle.

### 6. Módulos por Feature

Um módulo NestJS por feature em `adapters/modules/`, agrupando controller, use cases e providers da feature.

---

## Configuração de Referência

### TypeScript — strict, ES2022, NodeNext, path aliases

```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "NodeNext",
    "strict": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@adapters/*": ["src/adapters/*"],
      "@shared/*": ["src/shared/*"],
      "@src/*": ["src/*"],
      "@tests/*": ["tests/*"]
    }
  }
}
```

### Prettier — sem ponto-e-vírgula, aspas simples, 120 colunas

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "useTabs": false,
  "tabWidth": 2,
  "printWidth": 120,
  "semi": false
}
```

### ESLint — flat config com typescript-eslint + prettier

### Convenções de Código

- Sem ponto-e-vírgula.
- Aspas simples.
- 120 colunas max.
- Imports com path aliases (`@domain/`, `@adapters/`, `@shared/`, `@src/`, `@tests/`).
- Para símbolos puramente estáticos (interfaces, type aliases), usar `import type { ... }`.

---

## Pirâmide de Testes

```
        ▲
       / \     [Playwright] Jornada Real de API (Black-box sobre HTTP / TCP)
      /   \
     /-----\   [Vitest + Supertest] Integração de Camadas (Fastify / Pipes / Guards / DTOs)
    /       \
   /---------\ [Vitest] Domínio Puro e Use Cases (Invariantes ricas e 100% de branches)
```

| Camada | Localização | Ferramenta | O que valida |
|---|---|---|---|
| Unitários | `*.spec.ts` (colocalizados) | Vitest | Domínio, use cases, guards, filters |
| E2E | `tests/e2e/*.e2e-spec.ts` | Vitest + Supertest | Integração HTTP com FastifyAdapter em memória |
| Jornada de API | `tests/playwright/*.spec.ts` | Playwright | Fluxo real sobre HTTP + PostgreSQL |

### Convenções de Testes

| Tipo | Naming | Localização |
|---|---|---|
| Entidades | `*.model.spec.ts` | Colocalizado com o model |
| Use Cases | `*.usecase.spec.ts` | Colocalizado com o use case |
| Unitários gerais | `*.spec.ts` | Colocalizado com o fonte |
| E2E | `*.e2e-spec.ts` | `tests/e2e/` |
| Integração | `*.integration.spec.ts` | `tests/integration/` |
| Jornada de API | `*.spec.ts` | `tests/playwright/` |

---

## Fluxo Spec-Driven com OpenSpec

Quando um dev recebe uma User Story:

1. **Ler a US**, critérios de aceitação e notas de negócio.
2. **Explorar** o estado atual da spec e do código: `/opsx: explore`
3. **Propor** a mudança na spec (paths, schemas, exemplos): `/opsx: propose`
4. **Revisar** a proposta com o time/PO.
5. **Implementar** com base na spec aprovada: `/opsx: apply`
6. **Verificar** aderência à spec: `/opsx: verify`
7. **Arquivar** a change após aprovação: `/opsx: archive`

### Regras de Spec-Driven Development

1. **US → Spec → Código** — a implementação segue a spec, nunca o contrário.
2. **Cada US mapeada na spec** — usar anotação `x-us-id: US-001` para rastreabilidade.
3. **Refinement técnico** — validar se a spec atende todos os critérios de aceitação.
4. **Breaking changes** — mudanças incompatíveis exigem bump de versão da spec.

### Tipos de mudança no OpenSpec

| Tipo | Quando usar | `skip_specs` |
|---|---|---|
| Feature (US) | Implementar uma User Story | `false` (spec obrigatória) |
| Enabler técnico | Bootstrap, refactors, tooling | `true` (sem mudança comportamental) |

---

## PR Workflow

Cada PR deve:

- Referenciar a(s) US(s) no título (ex.: `feat(US-001): criar tarefa`).
- Incluir atualização da spec, schema Drizzle + migração (se aplicável), implementação e testes.

### Checklist de PR

- [ ] US referenciada no título ou descrição.
- [ ] Spec atualizada para refletir a US.
- [ ] Drizzle schema + migração atualizados (se aplicável).
- [ ] Entidade de domínio rica com validação de invariantes e testes (`*.model.spec.ts`).
- [ ] Use cases com testes de propagação de erro (`*.usecase.spec.ts`).
- [ ] Testes cobrindo critérios de aceitação + e2e.
- [ ] Quality gates executados localmente:

```bash
pnpm lint              # ESLint sem erros
pnpm test              # Testes unitários
pnpm test:cov          # Cobertura >95% global, 100% models e use cases
pnpm test:e2e          # Testes e2e
pnpm test:pw           # Jornada de API Playwright
pnpm build             # Compilação SWC + TSC
```
