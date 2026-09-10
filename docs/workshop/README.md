# Workshop: Spec-Driven Development na Prática

Tutorial reproduzível que demonstra, passo a passo, como construir uma API REST usando Spec-Driven Development com OpenSpec, NestJS, Fastify e Drizzle ORM.

> **Objetivo**: Ao final deste workshop, o time será capaz de aplicar o fluxo **US → Spec → Código → Testes** em qualquer projeto, usando OpenSpec para rastrear cada decisão.

---

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para PostgreSQL)
- Editor com suporte a TypeScript (VS Code, Antigravity IDE, etc.)

---

## Índice

| Etapa | Título | O que demonstra |
|---|---|---|
| 0 | [Estrutura inicial e User Stories](#etapa-0--estrutura-inicial-e-user-stories) | Como organizar requisitos e inicializar OpenSpec |
| 1 | [Bootstrap do projeto NestJS](#etapa-1--bootstrap-do-projeto-nestjs) | Enabler técnico sem US — fluxo OpenSpec com `skip_specs` |
| 2 | [Criar a spec OpenAPI](#etapa-2--criar-a-spec-openapi) | Spec-first: contrato antes do código |
| 3 | [Implementar ErrorResponse (US-007)](#etapa-3--implementar-errorresponse-us-007) | Tratamento global de erros como primeiro passo |
| 4 | [Implementar API Key Guard (US-006)](#etapa-4--implementar-api-key-guard-us-006) | Segurança transversal com Secure by Default |
| 5 | [Implementar criação de tarefa (US-001)](#etapa-5--implementar-criação-de-tarefa-us-001) | Rich Domain Model, Clean Architecture e testes de propagação |
| 6 | [Implementar consulta de tarefa (US-003)](#etapa-6--implementar-consulta-de-tarefa-us-003) | Leitura unitária e soft delete na query |
| 7 | [Implementar listagem paginada (US-002)](#etapa-7--implementar-listagem-paginada-us-002) | Paginação, coerção de tipos e contagem atômica |
| 8 | [Implementar atualização parcial (US-004)](#etapa-8--implementar-atualização-parcial-us-004) | PATCH semântico, no-op e revalidação de invariantes |
| 9 | [Implementar remoção de tarefa (US-005)](#etapa-9--implementar-remoção-de-tarefa-us-005) | Soft delete como regra de negócio no domínio |
| 10 | [Testes de jornada com Playwright](#etapa-10--testes-de-jornada-com-playwright) | Pirâmide completa de testes com API black-box |
| 11 | [Validação final](#etapa-11--validação-final) | Quality gates e métricas de qualidade |

---

## Etapa 0 — Estrutura inicial e User Stories

**Objetivo**: Criar o repositório com a documentação base e inicializar o OpenSpec.

### O que o PO entrega

O PO escreve 7 User Stories cobrindo o MVP, armazenadas em `docs/`:

| US | Título | Tipo |
|---|---|---|
| US-001 a US-005 | CRUD de tarefas | Funcional |
| US-006 | Autenticação via API Key | Transversal |
| US-007 | Respostas de erro padronizadas | Transversal |

Cada US segue o formato: ator, objetivo, benefício, critérios de aceitação e notas de negócio.

### Inicializar o OpenSpec

```bash
npx @fission-ai/openspec@latest init --tools antigravity --language pt-br --no-animation .
```

O que o `init` cria:

| Diretório | Propósito |
|---|---|
| `openspec/config.yaml` | Configuração do OpenSpec |
| `openspec/specs/` | Specs de capacidades (persistem) |
| `openspec/changes/` | Change proposals (ciclo de vida) |
| `.agents/skills/openspec-*/` | Skills para AI agents |
| `.agents/workflows/opsx-*.md` | Workflows correspondentes |

### Conceitos-chave

- **Spec** (`openspec/specs/`): Documentação de uma capacidade do sistema. Persiste após a mudança.
- **Change** (`openspec/changes/<nome>/`): Proposta de mudança com artifacts (proposal, design, tasks). Ciclo: propor → aplicar → verificar → arquivar.

### 💡 Lição

> Antes de escrever qualquer código, invista tempo nas User Stories **e** inicialize as ferramentas de spec. O `openspec init` cria a estrutura que guia todo o fluxo — sem ela, não há como rastrear changes ou arquivar decisões.

---

## Etapa 1 — Bootstrap do projeto NestJS

**Objetivo**: Criar a base técnica (projeto compilando, testes rodando, lint configurado).

> O bootstrap é um **enabler técnico**, não uma funcionalidade. Mesmo assim, passa pelo fluxo OpenSpec com `skip_specs: true`.

### Fluxo OpenSpec para enablers

```bash
# Com AI agent:
/opsx-propose nestjs-bootstrap
/opsx-apply
/opsx-archive

# Manualmente:
openspec new change "nestjs-bootstrap"
# Editar .openspec.yaml → skip_specs: true
# Criar proposal.md, design.md e tasks.md
# Implementar as tasks
# Validar e arquivar
```

O `skip_specs: true` declara que esta change não altera comportamento da API. Isso é honesto — não inventamos specs artificiais para infraestrutura.

### O que é configurado

| Componente | Ferramenta | Decisão relacionada |
|---|---|---|
| Package manager + deps | pnpm + package.json | — |
| TypeScript | Strict mode, path aliases, ES2022 | — |
| Build | SWC via `unplugin-swc` | [D-006](../adr/) |
| HTTP | NestJS 12 + Fastify 5 | [D-004](../adr/), [D-005](../adr/) |
| Testes | Vitest (3 perfis: unit, integration, e2e) | [D-003](../adr/), [D-008](../adr/) |
| Lint | ESLint flat config + Prettier | [D-009](../adr/) |
| Banco | Docker Compose com PostgreSQL 15-alpine | [D-010](../adr/) |
| Swagger | @nestjs/swagger + @fastify/swagger | [D-011](../adr/) |

### Validação

```bash
pnpm lint && pnpm build && pnpm test
```

### 💡 Lição

> O bootstrap correto economiza horas de debugging. Path aliases, lint e formatação devem funcionar desde o commit zero. E mesmo sem US, o bootstrap passa pelo OpenSpec — o processo funciona para qualquer tipo de mudança.

---

## Etapa 2 — Criar a spec OpenAPI

**USs abordadas**: US-006 (securitySchemes) + US-007 (ErrorResponse) + schemas base

**Objetivo**: Criar o contrato OpenAPI **antes** de qualquer código de negócio.

### Por que a spec vem primeiro?

A spec OpenAPI é o **contrato central** do projeto:

- **Fonte de verdade** para PO, dev, QA e consumidores da API.
- **Base para validação** — qualquer implementação que contradiga a spec é um bug.
- **Documentação viva** — o Swagger que o time consulta É o sistema.

### Fluxo OpenSpec

```bash
/opsx-propose task-api-spec    # Propor a spec completa
/opsx-apply                    # Implementar (criar spec/open-spec.yaml)
/opsx-archive                  # Arquivar a change
```

### O que a spec define

| Componente | Conteúdo |
|---|---|
| **Schemas** | `Task`, `CreateTaskInput`, `UpdateTaskInput`, `ErrorResponse`, `PaginatedTasksResponse`, `TaskStatus` |
| **Security** | `ApiKeyAuth` (header `x-api-key`) global |
| **Paths** | 5 endpoints com `x-us-id` para rastreabilidade |
| **Responses** | Sucesso + todos os erros com exemplos concretos |

### Decisões tomadas nesta etapa

| Decisão | Escolha | Por quê? |
|---|---|---|
| Soft delete (US-005) | `deletedAt` | Audit trail; padrão da referência |
| API Key ausente (US-006) | HTTP 401 | RFC 7235: ausência = não autenticado |
| Formato timestamps | ISO 8601 UTC | Padrão OpenAPI; legível |
| Paginação | 0-based | Alinhado com US-002 |

### Checklist de validação da spec

- [ ] Cada US possui path correspondente com `x-us-id`?
- [ ] Constraints de validação (minLength, enum, etc.) estão na spec?
- [ ] Todos os status codes (sucesso + erro) documentados?
- [ ] `ErrorResponse` referenciado em todas as 4xx/5xx?
- [ ] `security` global aplicada?

### 💡 Lição

> A spec nos forçou a responder perguntas (401 vs 403? soft delete? paginação 0-based?) que, sem spec, só apareceriam no code review ou em produção.

---

## Etapa 3 — Implementar ErrorResponse (US-007)

**US**: [us-007-padronizar-erros.md](../us-007-padronizar-erros.md)

**Objetivo**: Padronizar **todas** as respostas de erro da API em um formato único.

### Fluxo spec-driven

1. Verificar schema `ErrorResponse` na spec.
2. Implementar `AllExceptionsFilter` global.
3. Criar DTO `ErrorResponseDto`.
4. Testes unitários para o filter.

### O que é criado

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Shared | `src/shared/dto/error-response.dto.ts` | DTO de resposta de erro |
| Adapter | `src/adapters/api/filters/all-exceptions.filter.ts` | Catch-all de exceções |
| Testes | `src/adapters/api/filters/all-exceptions.filter.spec.ts` | 12 testes unitários |
| Config | `src/app.module.ts` | Registro via `APP_FILTER` |

O `AllExceptionsFilter` trata 3 tipos de exceção:
1. `DomainException` → mapeia para `ErrorResponse` com code e status.
2. `HttpException` (NestJS) → extrai mensagem e details.
3. Exceções genéricas → `INTERNAL_SERVER_ERROR` (500).

### 💡 Lição

> Comece pelo tratamento de erros. Quando o formato de erro está padronizado desde o início, todos os endpoints seguem o mesmo contrato automaticamente.

---

## Etapa 4 — Implementar API Key Guard (US-006)

**US**: [us-006-autenticacao-api-key.md](../us-006-autenticacao-api-key.md)

**Objetivo**: Proteger **todos** os endpoints da API com autenticação via API Key.

### Padrão: Secure by Default

O `ApiKeyGuard` é registrado globalmente via `APP_GUARD`. Nenhum endpoint novo fica acidentalmente desprotegido.

Para rotas públicas (como Swagger), usamos o decorator `@Public()` com `Reflector` — uma exceção explícita e controlada.

### O que é criado

| Camada | Arquivo | Responsabilidade |
|---|---|---|
| Adapter | `src/adapters/api/guards/api-key.guard.ts` | Validação do header `x-api-key` |
| Adapter | `src/adapters/api/guards/public.decorator.ts` | Decorator `@Public()` |
| Testes | `src/adapters/api/guards/api-key.guard.spec.ts` | 4 testes unitários |
| Config | `.env` / `.env.example` | `API_KEY=my-dev-api-key-123` |

### Fluxo do Guard

```
Requisição → ApiKeyGuard
  ├── @Public()? → Liberar
  ├── x-api-key ausente? → DomainException(UNAUTHORIZED, 401)
  ├── x-api-key inválida? → DomainException(INVALID_API_KEY, 401)
  └── x-api-key válida → Autorizar
```

### 💡 Lição

> Guards transversais registrados como `APP_GUARD` protegem a aplicação inteira por padrão. O `@Public()` com `Reflector` oferece uma saída explícita para rotas públicas.

---

## Etapa 5 — Implementar criação de tarefa (US-001)

**US**: [us-001-criar-tarefa.md](../us-001-criar-tarefa.md)

**Objetivo**: Primeira US de negócio — estabelece os padrões de Rich Domain Model e Clean Architecture.

### O que esta etapa ensina

Esta é a etapa mais importante do workshop. Ela estabelece dois padrões obrigatórios:

1. **Rich Domain Model**: O construtor da entidade `Task` valida invariantes (título 3-100 caracteres, descrição max 2000, status válido) lançando `DomainException`. Suíte `*.model.spec.ts` colocalizada testa 100% dessas condições.

2. **Propagação de Erros nos Use Cases**: Testes verificam que erros do repositório são propagados sem supressão silenciosa, e que dados inválidos abortam o fluxo antes de tocar a persistência.

### Camadas implementadas

| Camada | O que é criado |
|---|---|
| **Domínio** | Entidade `Task`, `TaskStatus`, port `TaskRepository`, `CreateTaskUseCase` |
| **Adaptadores** | `DrizzleTaskRepository`, `CreateTaskDto`, `TaskResponseDto`, `TasksController`, `TasksModule` |
| **Schema** | Tabela `tasks` com UUID, timestamps, soft delete e enum `task_status` |
| **Testes** | Unitários (model, use case, controller, repository) + E2E (4 cenários) |

### Fluxo OpenSpec

```bash
/opsx-propose us-001-create-task
/opsx-apply       # Implementar com base na spec
/opsx-archive     # Arquivar após validação
```

### 💡 Lição

> A spec e os DTOs blindam a borda HTTP, mas o domínio se auto-defende. Modelos anêmicos são proibidos — a entidade é responsável por garantir que nunca existirá em estado inválido.

---

## Etapa 6 — Implementar consulta de tarefa (US-003)

**US**: [us-003-consultar-tarefa.md](../us-003-consultar-tarefa.md)

**Objetivo**: Implementar a consulta individual validando o ciclo de leitura unitária.

### O que esta etapa ensina

- Extensão incremental do port `TaskRepository` com `findById`.
- Soft delete respeitado na query: `isNull(tasks.deletedAt)` no SQL.
- Validação de UUID na borda via `ParseUUIDPipe({ version: '4' })`.
- Exceção de domínio `TASK_NOT_FOUND` no use case (não no controller).

### Camadas implementadas

| Camada | O que é criado/modificado |
|---|---|
| **Domínio** | `GetTaskByIdUseCase` + testes (sucesso, 404, propagação) |
| **Adaptadores** | `findById` no repositório, rota `GET /tasks/:id` no controller |
| **Testes** | E2E: 200, 404, 400 (UUID inválido), 401 |

### 💡 Lição

> Implementar a consulta individual logo após a criação valida o ciclo de leitura antes da complexidade de paginação. O `ParseUUIDPipe` barra parâmetros malformados sem desperdiçar consultas ao banco.

---

## Etapa 7 — Implementar listagem paginada (US-002)

**US**: [us-002-listar-tarefas.md](../us-002-listar-tarefas.md)

**Objetivo**: Implementar a listagem com paginação, ordenação e contagem atômica.

### O que esta etapa ensina

- **Coerção de query strings**: Fastify entrega query params como strings. `@Type(() => Number)` no DTO com `class-transformer` resolve antes da validação numérica.
- **Paginação atômica**: Consulta dupla no Drizzle (count agregado + select paginado) evita inconsistência entre total e itens.
- **Defaults defensivos**: `page: 0`, `pageSize: 10` aplicados no use case.

### Camadas implementadas

| Camada | O que é criado/modificado |
|---|---|
| **Domínio** | `FindAllTasksParams`, `PaginatedResult<T>`, `ListTasksUseCase` |
| **Adaptadores** | `findAll` no repositório, `ListTasksQueryDto`, `PaginatedTasksResponseDto`, rota `GET /tasks` |
| **Testes** | E2E: 7 cenários (lista vazia, paginação, defaults, validação) |

### 💡 Lição

> Paginação esconde armadilhas: coerção de tipos em query strings, exclusão de soft-deleteds no totalizador, e defaults que devem estar definidos na spec antes de codificar.

---

## Etapa 8 — Implementar atualização parcial (US-004)

**US**: [us-004-atualizar-tarefa.md](../us-004-atualizar-tarefa.md)

**Objetivo**: Implementar PATCH semântico com revalidação de invariantes.

### O que esta etapa ensina

- **Método `update()` na entidade rica**: Retorna uma nova instância revalidando todas as invariantes. Impede que atualizações parciais quebrem regras de negócio.
- **Semântica de null vs undefined**: Campo omitido (`undefined`) = não alterar. Campo explicitamente `null` = limpar valor.
- **No-op com corpo vazio `{}`**: Se nenhum campo é enviado, o use case retorna a entidade sem tocar o banco, preservando o `updatedAt` real.

### Camadas implementadas

| Camada | O que é criado/modificado |
|---|---|
| **Domínio** | `UpdateTaskProps`, método `task.update()`, `UpdateTaskUseCase` |
| **Adaptadores** | `update` no repositório, `UpdateTaskDto`, rota `PATCH /tasks/:id` |
| **Testes** | 10 testes unitários do modelo + 7 do use case + 10 e2e |

### 💡 Lição

> PATCH semântico exige cuidado com a distinção entre campo omitido e anulação explícita. O Rich Domain Model garante que a entidade nunca transite em estado inválido, mesmo em atualizações parciais.

---

## Etapa 9 — Implementar remoção de tarefa (US-005)

**US**: [us-005-remover-tarefa.md](../us-005-remover-tarefa.md)

**Objetivo**: Implementar soft delete como regra de negócio no domínio.

### O que esta etapa ensina

- **Soft delete no Rich Domain Model**: Método `task.delete()` marca `deletedAt` e `updatedAt`, e valida que a tarefa não foi excluída anteriormente.
- **Interrupção de efeitos colaterais**: Se a entidade não é encontrada ou já foi excluída, o repositório **não é acionado**.

### Camadas implementadas

| Camada | O que é criado/modificado |
|---|---|
| **Domínio** | Método `task.delete()` + testes, `DeleteTaskUseCase` |
| **Adaptadores** | `delete` no repositório (SQL update), rota `DELETE /tasks/:id` (204 No Content) |
| **Testes** | 3 unitários do modelo + 5 do use case + 6 e2e |

### 💡 Lição

> Soft delete é uma decisão de negócio. Implementá-lo como método do Rich Domain Model garante que entidades excluídas não sofram novas mutações. A interrupção de efeitos colaterais no use case garante que o banco nunca é acionado desnecessariamente.

---

## Etapa 10 — Testes de jornada com Playwright

**Objetivo**: Fechar a pirâmide de testes com API testing black-box.

### Por que Playwright para API testing?

Testes unitários e e2e com Supertest validam componentes isolados. Mas somente testes **black-box sobre HTTP real** garantem que um cliente externo vivencia o comportamento contratado na spec.

### Pirâmide completa

```
        ▲
       / \     [Playwright] Jornada Real de API (HTTP real + PostgreSQL real)
      /   \
     /-----\   [Vitest + Supertest] Integração de Camadas (Fastify em memória)
    /       \
   /---------\ [Vitest] Domínio Puro e Use Cases (Invariantes e 100% de branches)
```

### O que é configurado

- `playwright.config.ts`: API Testing sem navegadores (fixture `request`/`APIRequestContext`).
- `webServer`: Inicia `pnpm start:dev` e aguarda `/api/docs` antes dos testes.
- Scripts: `pnpm test:pw` e `pnpm test:pw:report`.

### A suíte de jornada

```
tests/playwright/tasks-api.spec.ts (serial)
  1. POST /tasks     → 201 Created
  2. GET /tasks/{id} → 200 OK (dados persistidos)
  3. PATCH /tasks/{id} → 200 OK (status alterado)
  4. GET /tasks      → 200 OK (tarefa na listagem)
  5. DELETE /tasks/{id} → 204 No Content
  6. GET /tasks/{id} → 404 TASK_NOT_FOUND (soft delete confirmado)
  7. GET /tasks (sem x-api-key) → 401 UNAUTHORIZED
  8. GET /tasks/invalid-uuid → 400 VALIDATION_ERROR
```

### 💡 Lição

> Testes unitários garantem a lógica interna. Testes de integração garantem que os adaptadores funcionam. Mas somente testes black-box com Playwright garantem que um cliente HTTP externo vivencia exatamente o comportamento contratado na spec.

---

## Etapa 11 — Validação final

**Objetivo**: Executar todos os quality gates e confirmar a aderência completa da implementação à spec.

### Comandos de validação

```bash
pnpm lint              # ESLint: 0 erros/warnings
pnpm build             # SWC + TSC: compilação sem erros
pnpm test              # Vitest: 75 testes unitários
pnpm test:cov          # Cobertura: 98.51% linhas, 100% funções
pnpm test:e2e          # Supertest: 32 testes e2e
pnpm test:pw           # Playwright: 8 testes sobre HTTP real
openspec validate --specs  # Specs válidas
```

### Resultados

| Camada | Comando | Resultado |
|---|---|---|
| Lint & Padrões | `pnpm lint` | ✅ 0 erros |
| Build | `pnpm build` | ✅ 26 arquivos |
| Unitários | `pnpm test` | ✅ 75 testes |
| Cobertura | `pnpm test:cov` | ✅ 98.51% linhas |
| E2E | `pnpm test:e2e` | ✅ 32 testes |
| Jornada API | `pnpm test:pw` | ✅ 8 testes |
| Specs | `openspec validate` | ✅ válidas |

---

## Para levar daqui

1. **Nenhum endpoint nasce no código**: Documente a US, proponha a spec, valide o contrato e só então implemente.
2. **Modelos anêmicos são proibidos**: Centralize validações dentro da entidade de domínio rica.
3. **Use cases devem propagar falhas**: Nunca silencie exceções; assegure nos testes que efeitos colaterais são abortados.
4. **Execute `pnpm test:pw` antes de abrir PR**: Testar contra servidor e banco reais é a melhor proteção contra falhas de rede e serialização.
5. **Cada decisão é rastreável**: ADRs existem para que o time saiba *por quê*, não só *o quê*.
