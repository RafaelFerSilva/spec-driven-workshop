# Workshop: Spec-Driven Development na Prática

Tutorial reproduzível que demonstra, passo a passo, como construir uma API REST usando **Spec-Driven Development** com **OpenSpec**, **NestJS 11**, **Express**, **Drizzle ORM**, **Biome**, **Vitest** e **Playwright**.

> **Objetivo**: Ao final deste workshop, o time de engenharia será capaz de aplicar o fluxo **US → Spec → Código → Testes** em qualquer projeto, usando OpenSpec para rastrear cada decisão arquitetural e funcional com rastreabilidade total.

---

## 🧠 O Que é Spec-Driven Development (SDD)?

### 1. Conceito e Filosofia

**Spec-Driven Development (Desenvolvimento Orientado por Especificação)** é uma metodologia de engenharia de software onde a **especificação técnica, funcional e comportamental atua como a Fonte Única da Verdade (SSOT)** *antes* que o código de produção seja implementado.

No modelo tradicional (*Code-First*), o código é escrito diretamente e a documentação é tratada como obrigação posterior (ou negligenciada), tornando-se obsoleta quase de imediato e gerando o clássico problema de *split-brain* entre a visão de produto, a arquitetura planejada e o sistema real em produção.

No **SDD**, o paradigma se inverte:

```text
  TRADICIONAL (Code-First):
  Requisito Vago ──► Código ──► Testes Ajustados ao Código ──► Documentação Obsoleta ❌

  SPEC-DRIVEN DEVELOPMENT (Spec-First):
  User Story ──► Especificação Formal ──► Código Fiel à Spec ──► Testes Validando a Spec ✅
                       ▲                                                    │
                       └───────────── Verificação Contínua ─────────────────┘
```

### 2. Objetivos Centrais do SDD

- **Contrato Imutável e Transparente**: Alinha Produto, Arquitetura, Engenharia e QA sob uma linguagem técnica inequívoca antes de investir esforço em codificação.
- **Rastreabilidade Total Ponta a Ponta**: Cada linha de código, endpoint e teste possui rastreabilidade direta para a especificação formal (`openspec/specs/`) e a User Story (`x-us-id`).
- **Eliminação de Ambiguidade e Retrabalho**: Suposições e lacunas de negócio são resolvidas na fase de proposta e design, evitando refatorações estruturais caras após o código pronto.
- **Desenvolvimento Paralelo Desacoplado**: Engenheiros de front-end e QA podem criar mocks, suítes de testes e contratos de integração imediatamente a partir da spec, sem esperar pela conclusão do back-end.

### 3. Aplicações no Mundo Real

- **APIs REST e Microsserviços**: Contratos rigorosos de entrada/saída (OpenAPI), validação defensiva e tratamento padronizado de erros.
- **Sistemas Críticos e Auditáveis**: Histórico durável de quando, por que e como cada regra de negócio foi alterada ou introduzida no repositório.
- **Engenharia com Agentes de IA (Agentic Pair Programming)**: LLMs operam com precisão exponencial quando delimitadas por especificações formais, eliminando alucinações e desvios de arquitetura.

### 4. O Fluxo OpenSpec no Ciclo de Vida do Projeto

Neste projeto, o **OpenSpec** é o motor que orquestra o SDD. O ciclo de vida de qualquer alteração técnica ou de negócio segue 4 fases atômicas:

```text
  ┌────────────────┐     ┌────────────────┐     ┌────────────────┐     ┌────────────────┐
  │  /opsx-explore │ ──► │  /opsx-propose │ ──► │  /opsx-apply   │ ──► │  /opsx-archive │
  └────────────────┘     └────────────────┘     └────────────────┘     └────────────────┘
      EXPLORAR                 PROPOR                 APLICAR                ARQUIVAR
   Entendimento do       Criação de proposal,    Implementação do       Sincronização com
   estado atual e        design, specs delta     código e suíte de      as specs canônicas e
   requisitos pendentes  e tarefas atômicas      testes unit/e2e        arquivo histórico
```

- **`openspec/specs/`**: Especificações duráveis e canônicas que descrevem as capacidades ativas do sistema.
- **`openspec/changes/`**: Propostas ativas de mudança, isoladas e rastreáveis até serem completamente testadas e arquivadas.
- **`openspec/changes/archive/`**: Registro histórico e imutável de todas as decisões e mudanças aplicadas.

---

## Pré-requisitos

- Node.js 22+
- pnpm 11+
- Docker (para PostgreSQL via Docker Compose)
- Editor com suporte a TypeScript (VS Code, Cursor, Antigravity IDE, etc.)

---

## 📖 Fonte da Verdade Arquitetural (SSOT)

Neste projeto, **não mantemos documentações estáticas paralelas** (como `architecture.md` ou manuais duplicados) para evitar o problema de *split-brain*. As decisões de arquitetura e padrões de engenharia são regidos diretamente pela estrutura viva do template:

- **Constituição e Topologia do Projeto:** [`AGENTS.md`](../../AGENTS.md)
- **Regras de Clean Architecture e DIP:** [`.agents/rules/architecture-rules.md`](../../.agents/rules/architecture-rules.md)
- **Convenções de Código, Naming e Biome:** [`.agents/rules/code-rules.md`](../../.agents/rules/code-rules.md)
- **Regras Universais do Projeto:** [`.agents/rules/universal-rules.md`](../../.agents/rules/universal-rules.md)
- **Guia de Testes (Vitest & Mocking):** [`.agents/skills/testing-guide/SKILL.md`](../../.agents/skills/testing-guide/SKILL.md)
- **Design de APIs e Documentação:** [`.agents/skills/api-design/SKILL.md`](../../.agents/skills/api-design/SKILL.md)
- **Padrões Drizzle ORM:** [`.agents/skills/drizzle-patterns/SKILL.md`](../../.agents/skills/drizzle-patterns/SKILL.md)

---

## Índice

| Etapa | Título | Comando OpenSpec | O que demonstra |
| :---: | ------ | :--------------: | --------------- |
| 0 | [Estrutura inicial e User Stories](#etapa-0--estrutura-inicial-e-user-stories) | `/opsx-explore` | Como organizar requisitos de negócio e inicializar o OpenSpec |
| 1 | [Bootstrap do projeto NestJS](#etapa-1--bootstrap-do-projeto-nestjs) | `/opsx-propose nestjs-bootstrap` | Enabler técnico sem US — fluxo OpenSpec com `skip_specs` |
| 2 | [Criar a spec OpenAPI](#etapa-2--criar-a-spec-openapi) | `/opsx-propose task-api-spec` | Spec-first: contrato antes do código |
| 3 | [Implementar ErrorResponse (US-007)](#etapa-3--implementar-errorresponse-us-007) | `/opsx-propose us-007-error-response` | Tratamento global de erros padronizado no template |
| 4 | [Implementar API Key Guard (US-006)](#etapa-4--implementar-api-key-guard-us-006) | `/opsx-propose us-006-api-key-auth` | Segurança transversal com Secure by Default (`APP_GUARD`) |
| 5 | [Implementar criação de tarefa (US-001)](#etapa-5--implementar-criação-de-tarefa-us-001) | `/opsx-propose us-001-create-task` | Rich Domain Model, Clean Architecture, DIP e testes de propagação |
| 6 | [Implementar consulta de tarefa (US-003)](#etapa-6--implementar-consulta-de-tarefa-us-003) | `/opsx-propose us-003-get-task` | Leitura unitária, pipes de UUID e soft delete na query |
| 7 | [Implementar listagem paginada (US-002)](#etapa-7--implementar-listagem-paginada-us-002) | `/opsx-propose us-002-list-tasks` | Paginação 0-based, contagem atômica e DTOs de consulta |
| 8 | [Implementar atualização parcial (US-004)](#etapa-8--implementar-atualização-parcial-us-004) | `/opsx-propose us-004-update-task` | PATCH semântico, no-op e revalidação de invariantes no domínio |
| 9 | [Implementar remoção de tarefa (US-005)](#etapa-9--implementar-remoção-de-tarefa-us-005) | `/opsx-propose us-005-delete-task` | Soft delete como regra de negócio e interrupção de efeitos colaterais |
| 10 | [Testes de jornada com Playwright](#etapa-10--testes-de-jornada-com-playwright) | `/opsx-propose playwright-e2e-journey` | Pirâmide completa de testes com API black-box sobre HTTP real |
| 11 | [Validação final](#etapa-11--validação-final) | `openspec validate --specs` | Quality gates com Biome, Vitest, Playwright e OpenSpec |

---

## Etapa 0 — Estrutura inicial e User Stories

**Objetivo**: Conhecer o backlog de requisitos de negócio e inicializar o ecossistema OpenSpec.

### O que o PO entrega

O PO escreve 7 User Stories cobrindo o MVP de Gestão de Tarefas, armazenadas em `docs/`:

| US | Título | Tipo | Arquivo |
| -- | ------ | ---- | ------- |
| US-001 a US-005 | CRUD de tarefas | Funcional | [user-stories.md](../user-stories.md) |
| US-006 | Autenticação via API Key | Transversal | [us-006-autenticacao-api-key.md](../us-006-autenticacao-api-key.md) |
| US-007 | Respostas de erro padronizadas | Transversal | [us-007-padronizar-erros.md](../us-007-padronizar-erros.md) |

Cada US segue o formato: ator, objetivo, benefício, critérios de aceitação e notas de negócio.

### Estrutura do OpenSpec

Para este projeto utilizamos o https://openspec.dev/ como ferramenta para execução do spec driven development

> OpenSpec é uma estrutura leve e configurável para criar e gerenciar especificações de software.

> Com o OpenSpec, você define em uma especificação o que deseja construir e mantém sua equipe e os desenvolvedores alinhados à medida que o trabalho evolui. Nós ajudamos você a refinar os requisitos, validar se eles descrevem a coisa certa e verificar se a implementação corresponde.

> Em essência, o OpenSpec ajuda você a construir a coisa certa e a construí-la da maneira correta .

Instalação Global

```bash
pnpm add -g @fission-ai/openspec@latest
```

Inicialização no projeto

```bash
openspec init
```

O OpenSpec no projeto é configurado em `openspec/config.yaml`:

| Diretório / Arquivo | Propósito |
| ------------------- | --------- |
| `openspec/config.yaml` | Configurações, stack do template, regras por artefato |
| `openspec/specs/` | Especificações duráveis de capacidades do sistema |
| `openspec/changes/` | Change proposals ativas (ciclo: propor → aplicar → verificar → arquivar) |
| `.agents/skills/` | Skills do assistente para automação do fluxo |
| `.agents/workflows/` | Workflows executáveis (`/opsx-explore`, `/opsx-propose`, etc.) |

### Explorar o estado do projeto

O primeiro passo do fluxo Spec-Driven é **explorar** — analisar o que existe no repositório antes de propor qualquer mudança:

```bash
# Com AI agent:
/opsx-explore

# O explore analisa:
# - USs em docs/ → identifica requisitos pendentes
# - Specs em openspec/specs/ → identifica capacidades existentes
# - Código em src/ → identifica o que já existe de exemplo e infraestrutura
# - Testes em tests/ e src/ → identifica cobertura existente
```

---

## Etapa 1 — Bootstrap do projeto NestJS

**Objetivo**: Validar a base técnica do template (compilação, linter com Biome, testes e banco).

> O bootstrap inicial de tooling ou infraestrutura é um **enabler técnico**, não uma funcionalidade de negócio. Mesmo assim, ele passa pelo fluxo OpenSpec usando `skip_specs: true`.

### Fluxo OpenSpec para enablers

```bash
# Com AI agent:
/opsx-propose nestjs-bootstrap
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "nestjs-bootstrap"
# No .openspec.yaml: skip_specs: true
# Criar proposal.md, design.md e tasks.md
# Aplicar e arquivar
```

O `skip_specs: true` declara formalmente que a mudança não altera capacidades comportamentais da API pública, evitando specs artificiais para infraestrutura.

### A Stack do Template

| Componente | Tecnologia | Papel na Arquitetura |
| ---------- | ---------- | -------------------- |
| Runtime & Pacotes | Node.js 22+ & pnpm 11+ | Ambiente base com tipagem estrita |
| Framework & HTTP | NestJS 11 + Express | Camada de apresentação e injeção de dependência |
| Linter & Formatter | Biome 2.5+ (`pnpm check`) | Linting e formatação ultrarrápidos em ferramenta única |
| TypeScript | Target ES2023, path alias `@/*` | Mapeamento limpo para `./src/*` |
| Banco & ORM | PostgreSQL + Drizzle ORM | Schemas tipados e migrations via `drizzle-kit` |
| Observabilidade | OpenTelemetry + Pino | Traces distribuídos e logs estruturados em JSON |
| Testes | Vitest + Supertest | Testes unitários e E2E rápidos |

### Validação do Bootstrap

```bash
pnpm check       # Biome: formatação e linting
pnpm build       # Compilação NestJS / TypeScript
pnpm test        # Testes unitários
pnpm test:e2e    # Testes E2E em memória com Supertest
```

---

## Etapa 2 — Criar a spec OpenAPI

**USs abordadas**: US-006 (securitySchemes) + US-007 (ErrorResponse) + Schemas de Tarefa.

**Objetivo**: Criar o contrato OpenAPI **antes** de qualquer implementação de código.

### Por que a spec vem primeiro?

A spec OpenAPI é o **contrato central** do projeto:
- **Fonte da verdade** para PO, desenvolvedores, QA e clientes.
- **Defesa de design** — qualquer implementação em desacordo com a spec é considerada defeito.
- **Documentação viva** — servida com interface interativa via Scalar/Swagger em `/api/docs`.

### Fluxo OpenSpec

```bash
/opsx-propose task-api-spec
/opsx-apply
/opsx-archive
```

### O que a spec define

| Componente | Conteúdo |
| ---------- | -------- |
| **Schemas** | `Task`, `CreateTaskInput`, `UpdateTaskInput`, `ErrorResponse`, `PaginatedTasksResponse`, `TaskStatus` |
| **Security** | `ApiKeyAuth` (header `x-api-key`) globalmente aplicado |
| **Paths** | Endpoints `/tasks` com anotação de rastreabilidade `x-us-id: US-001` |
| **Responses** | Exemplos de status codes de sucesso (200, 201, 204) e erro (400, 401, 404, 500) |

---

## Etapa 3 — Implementar ErrorResponse (US-007)

**US**: [us-007-padronizar-erros.md](../us-007-padronizar-erros.md)

**Objetivo**: Padronizar todas as respostas de erro da API no formato oficial do template.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-007-error-response
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-007-error-response"
# Implementar tarefas de openspec/changes/us-007-error-response/tasks.md
openspec archive --change "us-007-error-response"
```

### Padrão de Resposta do Template

O template padroniza respostas de erro em JSON estruturado com código semântico (`code`):
```json
{
  "code": "TASK_NOT_FOUND",
  "message": "Task with id 550e8400-e29b-41d4-a716-446655440000 was not found",
  "details": {
    "taskId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### O que é criado

| Camada | Arquivo | Responsabilidade |
| ------ | ------- | ---------------- |
| Domain (Exception) | `src/domain/exception/error-response.interface.ts` | Interface `{ code, message, details? }` |
| Domain (Exception) | `src/domain/exception/domain.exception.ts` | Classe base para erros de negócio com `errorCode` |
| Adapter (API) | `src/adapters/api/response/error-response.dto.ts` | DTO Swagger/Scalar para documentação de erros |
| Adapter (API) | `src/adapters/api/filters/global-exception.filter.ts` | Filter global que captura exceções e formata resposta |
| Testes | `src/adapters/api/filters/global-exception.filter.spec.ts` | Testes unitários cobrindo erros de domínio, HTTP e 500 |
| Módulo | `src/app.module.ts` | Registro global via `APP_FILTER` |

O filter intercepta:
1. `DomainException` (domínio) → mapeia para o status HTTP e payload `{ code, message, details }`.
2. `HttpException` (NestJS/ValidationPipe) → formata as mensagens de validação.
3. Exceções não tratadas → retorna 500 (`INTERNAL_SERVER_ERROR`) registrando o log estruturado com Pino.

---

## Etapa 4 — Implementar API Key Guard (US-006)

**US**: [us-006-autenticacao-api-key.md](../us-006-autenticacao-api-key.md)

**Objetivo**: Proteger os endpoints com autenticação via API Key seguindo o princípio **Secure by Default**.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-006-api-key-auth
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-006-api-key-auth"
# Implementar tarefas de openspec/changes/us-006-api-key-auth/tasks.md
openspec archive --change "us-006-api-key-auth"
```

### Padrão: Secure by Default

O `ApiKeyGuard` é registrado globalmente no `AppModule` via `APP_GUARD`. Nenhuma nova rota fica acidentalmente pública. Rotas públicas (como documentação `/api/docs` e health checks `/actuator/health`) usam o decorator explícito `@Public()` com `Reflector`.

### O que é criado

| Camada | Arquivo | Responsabilidade |
| ------ | ------- | ---------------- |
| Adapter (API) | `src/adapters/api/guards/api-key.guard.ts` | Validação do header `x-api-key` contra `process.env.API_KEY` |
| Adapter (API) | `src/adapters/api/guards/public.decorator.ts` | Decorator `@Public()` |
| Testes | `src/adapters/api/guards/api-key.guard.spec.ts` | Testes unitários (sem header, chave inválida, chave válida, rota pública) |
| Config | `.env` / `.env.example` | Definição da variável `API_KEY` |

```text
Requisição HTTP
      │
      ▼
ApiKeyGuard (APP_GUARD)
  ├── Possui @Public()? ──────► Liberar execução
  ├── Sem x-api-key? ─────────► 401 Unauthorized
  ├── x-api-key inválida? ────► 401 Unauthorized
  └── x-api-key válida ───────► Autorizar requisição
```

---

## Etapa 5 — Implementar criação de tarefa (US-001)

**US**: [us-001-criar-tarefa.md](../us-001-criar-tarefa.md)

**Objetivo**: Primeira US de negócio — estabelece os padrões de **Rich Domain Model**, Clean Architecture e **Inversão de Dependência (DIP)**.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-001-create-task
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-001-create-task"
# Implementar tarefas de openspec/changes/us-001-create-task/tasks.md
openspec archive --change "us-001-create-task"
```

### Padrões Fundamentais Desta Etapa

1. **Rich Domain Model (Não Anêmico)**:
   - A classe de domínio `Task` (`src/domain/model/task.model.ts`) valida suas próprias invariantes no construtor.
   - Proibido importar decorators de framework no domínio.
   - Suíte unitária `task.model.spec.ts` com **100% de cobertura de invariantes**.

2. **DIP com Classes Abstratas**:
   - O contrato `TaskRepository` (`src/domain/ports/repository/task.repository.ts`) é uma **classe abstrata**:
   ```typescript
   export abstract class TaskRepository {
     abstract create(task: Task): Promise<Task>
     abstract findById(id: string): Promise<Task | null>
     abstract findAll(params: FindAllTasksParams): Promise<PaginatedResult<Task>>
     abstract update(task: Task): Promise<Task>
     abstract delete(id: string): Promise<void>
   }
   ```
   - O repositório concreto `TaskRepositoryImpl` em `src/adapters/database/repository/task.repository.impl.ts` implementa essa classe usando Drizzle ORM.
   - No `TasksModule`, o binding é direto sem tokens manuais:
   ```typescript
   {
     provide: TaskRepository,
     useClass: TaskRepositoryImpl,
   }
   ```

3. **Propagação de Erros nos Use Cases**:
   - `CreateTaskUseCase` valida que falhas de persistência são propagadas e que dados inválidos abortam o fluxo antes de tocar o banco.

### Camadas Criadas

```text
src/
├── domain/
│   ├── model/task.model.ts + task.model.spec.ts
│   ├── ports/repository/task.repository.ts
│   └── usecase/create-task.usecase.ts + create-task.usecase.spec.ts
└── adapters/
    ├── database/
    │   ├── schemas/task.schema.ts
    │   └── repository/task.repository.impl.ts
    ├── api/tasks/
    │   ├── task.controller.ts
    │   ├── request/create-task.dto.ts
    │   └── response/task.response.dto.ts
    └── tasks/
        └── tasks.module.ts
```

---

## Etapa 6 — Implementar consulta de tarefa (US-003)

**US**: [us-003-consultar-tarefa.md](../us-003-consultar-tarefa.md)

**Objetivo**: Implementar consulta unitária por ID validando leitura e soft delete.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-003-get-task
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-003-get-task"
# Implementar tarefas de openspec/changes/us-003-get-task/tasks.md
openspec archive --change "us-003-get-task"
```

### O que esta etapa ensina

- Extensão do `TaskRepository` com o método `findById(id: string)`.
- Respeito ao soft delete na query Drizzle: `and(eq(tasks.id, id), isNull(tasks.deletedAt))`.
- Validação rápida na borda via `new ParseUUIDPipe({ version: '4' })`.
- Exceção de negócio `TaskNotFoundException` disparada pelo use case caso a tarefa não exista ou esteja deletada (resultando em 404 Not Found).

---

## Etapa 7 — Implementar listagem paginada (US-002)

**US**: [us-002-listar-tarefas.md](../us-002-listar-tarefas.md)

**Objetivo**: Implementar listagem com paginação 0-based, contagem atômica e defaults defensivos.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-002-list-tasks
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-002-list-tasks"
# Implementar tarefas de openspec/changes/us-002-list-tasks/tasks.md
openspec archive --change "us-002-list-tasks"
```

### O que esta etapa ensina

- **DTO de Consulta (`ListTasksQueryDto`)**: Uso de `class-transformer` com `@Type(() => Number)` e `class-validator` com `@IsOptional()`, `@Min(0)`, `@Max(100)`.
- **Defaults defensivos no UseCase**: `page = 0`, `pageSize = 10`.
- **Contagem Atômica no Drizzle**: Consulta agregando `count()` e busca paginada com `limit()` e `offset()`, filtrando tarefas com `isNull(tasks.deletedAt)`.
- **DTO de Saída (`PaginatedTasksResponseDto`)**:
  ```typescript
  export class PaginatedTasksResponseDto {
    items: TaskResponseDto[]
    total: number
    page: number
    pageSize: number
  }
  ```

---

## Etapa 8 — Implementar atualização parcial (US-004)

**US**: [us-004-atualizar-tarefa.md](../us-004-atualizar-tarefa.md)

**Objetivo**: Implementar PATCH semântico com revalidação das invariantes de domínio.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-004-update-task
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-004-update-task"
# Implementar tarefas de openspec/changes/us-004-update-task/tasks.md
openspec archive --change "us-004-update-task"
```

### O que esta etapa ensina

- **Método `task.update()` na entidade rica**: Em vez de modificar campos soltos no controller, a própria entidade recebe as novas propriedades, valida as invariantes e atualiza o timestamp `updatedAt`.
- **Semântica de null vs undefined**:
  - `undefined` (campo omitido no JSON): mantém o valor atual.
  - `null`: limpa o valor (por exemplo, na descrição opcional).
- **Otimização No-op**: Se nenhum campo foi modificado, o use case retorna a tarefa atual sem executar comandos desnecessários no banco de dados.

---

## Etapa 9 — Implementar remoção de tarefa (US-005)

**US**: [us-005-remover-tarefa.md](../us-005-remover-tarefa.md)

**Objetivo**: Implementar soft delete como regra de negócio no domínio.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose us-005-delete-task
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "us-005-delete-task"
# Implementar tarefas de openspec/changes/us-005-delete-task/tasks.md
openspec archive --change "us-005-delete-task"
```

### O que esta etapa ensina

- **Soft Delete no Domínio**: Método `task.delete()` marca `deletedAt = new Date()` e valida que uma tarefa já excluída não pode ser excluída novamente.
- **Interrupção de Efeitos Colaterais**: Se a tarefa não existir ou já estiver excluída, o caso de uso lança a exceção de negócio e **não aciona o repositório**.
- **Resposta HTTP 204 No Content**: Rota `DELETE /tasks/:id` responde sem corpo conforme o padrão REST do template.

---

## Etapa 10 — Testes de jornada com Playwright

**Objetivo**: Fechar a pirâmide de testes com testes de API black-box executados sobre HTTP e PostgreSQL reais.

### Fluxo OpenSpec

```bash
# Com AI agent:
/opsx-propose playwright-e2e-journey
/opsx-apply
/opsx-archive

# Manualmente via CLI:
openspec new change "playwright-e2e-journey"
# No .openspec.yaml declarar skip_specs: true (enabler de testes E2E)
openspec archive --change "playwright-e2e-journey"
```

### A Pirâmide Completa de Testes

```text
         ▲
        / \     [Playwright] Jornada Real de API (Black-Box sobre HTTP + PostgreSQL real)
       /   \
      /─────\   [Vitest + Supertest] Integração de Camadas (Pipes / Guards / Controllers)
     /       \
    /─────────\ [Vitest] Domínio Puro e Use Cases (Invariantes e 100% de branches)
```

### Setup do Playwright para API Testing

Adicionamos o Playwright como ferramenta focada em API (sem download de browsers pesados):

```bash
pnpm add -D @playwright/test
```

Configuração em `playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/playwright',
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  webServer: {
    command: 'pnpm start',
    url: 'http://localhost:3000/actuator/health',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
```

Scripts adicionados no `package.json`:
```json
"test:pw": "playwright test",
"test:pw:report": "playwright show-report"
```

### Suíte de Jornada Black-Box (`tests/playwright/tasks-api.spec.ts`)

Executa o fluxo completo do cliente:
1. `POST /tasks` → 201 Created (cria tarefa com dados válidos).
2. `GET /tasks/{id}` → 200 OK (valida se os dados foram persistidos).
3. `PATCH /tasks/{id}` → 200 OK (atualiza o status da tarefa).
4. `GET /tasks` → 200 OK (tarefa aparece na listagem paginada).
5. `DELETE /tasks/{id}` → 204 No Content (exclusão lógica).
6. `GET /tasks/{id}` → 404 Not Found (confirma que o soft delete excluiu da consulta).
7. `GET /tasks` (sem `x-api-key`) → 401 Unauthorized (segurança global).
8. `GET /tasks/uuid-invalido` → 400 Bad Request (validação do pipe de UUID).

---

## Etapa 11 — Validação final

**Objetivo**: Executar a bateria completa de quality gates garantindo 100% de conformidade técnica e aderência à spec.

### Comandos dos Quality Gates

```bash
pnpm check              # Biome: formatação e regras de linter sem erros
pnpm build              # Compilação limpa do TypeScript / NestJS
pnpm test               # Testes unitários com Vitest
pnpm test:cov           # Cobertura de testes unitários (>95% em domain e use cases)
pnpm test:e2e           # Testes de integração E2E com Vitest + Supertest
pnpm test:pw            # Testes de jornada completa black-box com Playwright
openspec validate --specs # Validação formal dos contratos OpenSpec
```

### Checklist Final do Workshop

- [ ] Requisitos documentados no padrão de User Stories.
- [ ] Especificações OpenAPI criadas e validadas antes do código.
- [ ] Entidades ricas de domínio defendendo suas invariantes sem dependência de framework.
- [ ] Use cases com testes de propagação de erro e sem supressão silenciosa.
- [ ] Inversão de dependência (DIP) usando classes abstratas do TypeScript.
- [ ] Segurança Secure by Default com `ApiKeyGuard` global e decorator `@Public()`.
- [ ] Testes de jornada cobrindo todo o ciclo de vida da API sobre HTTP real.
- [ ] Todas as decisões arquiteturais rastreáveis via OpenSpec.

---

## 🎯 Conclusão

Com este workshop, o time aprende que **Spec-Driven Development** não é sobre burocracia de documentação, mas sim sobre **clareza de contratos, segurança na implementação e qualidade do código entregue**.
