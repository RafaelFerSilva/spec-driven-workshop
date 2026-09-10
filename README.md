# Spec-Driven Development — Workshop

> Workshop prático para times de engenharia aprenderem a construir APIs usando o fluxo:
>
> **US (PO) → Spec (OpenSpec) → Código (NestJS + Drizzle) → Testes**

---

## O que é este repositório?

Este é o **ponto de partida** do workshop. Ele contém apenas a documentação que um time receberia antes de iniciar o desenvolvimento:

- **User Stories** escritas pelo PO (7 USs cobrindo um MVP de Task Management)
- **Padrões arquiteturais** que o time deve seguir
- **Tutorial passo a passo** para construir a API do zero

O código-fonte, as especificações OpenSpec, os testes e toda a infraestrutura serão **criados durante o workshop**.

---

## Estrutura do Repositório

```
spec-driven-workshop/
├── README.md                       ← Este arquivo
├── .gitignore
│
└── docs/                           ← Documentação (ponto de partida)
    ├── user-stories.md             ← Índice das 7 User Stories
    ├── us-001-criar-tarefa.md      ← POST /tasks
    ├── us-002-listar-tarefas.md    ← GET /tasks
    ├── us-003-consultar-tarefa.md  ← GET /tasks/{id}
    ├── us-004-atualizar-tarefa.md  ← PATCH /tasks/{id}
    ├── us-005-remover-tarefa.md    ← DELETE /tasks/{id}
    ├── us-006-autenticacao-api-key.md ← Guard x-api-key
    ├── us-007-padronizar-erros.md  ← ErrorResponse
    ├── architecture.md             ← Arquitetura e padrões técnicos alvo
    ├── adr/                        ← Architecture Decision Records (vazio — preenchido durante o workshop)
    └── workshop/                   ← Tutorial reproduzível passo a passo
        └── README.md
```

---

## Pré-requisitos

- Node.js 22+
- pnpm 10+
- Docker (para PostgreSQL)
- Editor com suporte a TypeScript (VS Code, Antigravity IDE, etc.)

---

## Como começar

1. **Leia as User Stories** em [`docs/user-stories.md`](docs/user-stories.md) — são os requisitos do PO.
2. **Consulte a arquitetura** em [`docs/architecture.md`](docs/architecture.md) — são os padrões que o time segue.
3. **Siga o tutorial** em [`docs/workshop/`](docs/workshop/) — é o passo a passo para construir a API.

O tutorial cobre 12 etapas, desde a inicialização do OpenSpec até a validação final com pirâmide completa de testes.

---

## O que será construído

Uma **API REST de gerenciamento de tarefas** com:

| Feature | Endpoint | US |
|---|---|---|
| Criar tarefa | `POST /tasks` | US-001 |
| Listar tarefas (paginado) | `GET /tasks` | US-002 |
| Consultar tarefa | `GET /tasks/{id}` | US-003 |
| Atualizar tarefa | `PATCH /tasks/{id}` | US-004 |
| Remover tarefa (soft delete) | `DELETE /tasks/{id}` | US-005 |
| Autenticação via API Key | Todos | US-006 |
| Respostas de erro padronizadas | Todos | US-007 |

### Stack alvo

| Componente | Tecnologia |
|---|---|
| Framework | NestJS 12 + Fastify 5 |
| ORM | Drizzle ORM |
| Banco | PostgreSQL 15 (Docker) |
| Testes | Vitest + Supertest + Playwright |
| Spec | OpenSpec (Spec-Driven Development) |

---

## Para times usando AI Coding Agents

Se o time usa ferramentas como Antigravity, Cursor ou Copilot, o workshop pode ser acelerado com os comandos OpenSpec:

```bash
# Inicializar o OpenSpec (Etapa 0)
npx @fission-ai/openspec@latest init --tools antigravity --language pt-br --no-animation .

# Propor, implementar e arquivar mudanças (Etapas 1+)
/opsx-propose <nome-da-change>
/opsx-apply
/opsx-archive
```

Após o `openspec init`, um arquivo `AGENTS.md` com instruções operacionais deve ser criado na raiz. Consulte a [documentação de arquitetura](docs/architecture.md) para os padrões que o agente deve seguir.
