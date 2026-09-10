# User Stories – Task Management (MVP)

Índice de User Stories do projeto. Cada US está documentada em arquivo individual para facilitar rastreabilidade e trabalho paralelo.

| US | Título | Arquivo | Tipo | Status | Endpoint / Componente |
|---|---|---|---|---|---|
| US-001 | Criar tarefa | [us-001-criar-tarefa.md](./us-001-criar-tarefa.md) | CRUD | ✅ Concluída | `POST /tasks` |
| US-002 | Listar tarefas com paginação | [us-002-listar-tarefas.md](./us-002-listar-tarefas.md) | CRUD | ✅ Concluída | `GET /tasks` |
| US-003 | Consultar detalhes de uma tarefa | [us-003-consultar-tarefa.md](./us-003-consultar-tarefa.md) | CRUD | ✅ Concluída | `GET /tasks/{id}` |
| US-004 | Atualizar parcialmente uma tarefa | [us-004-atualizar-tarefa.md](./us-004-atualizar-tarefa.md) | CRUD | ✅ Concluída | `PATCH /tasks/{id}` |
| US-005 | Remover uma tarefa | [us-005-remover-tarefa.md](./us-005-remover-tarefa.md) | CRUD | ✅ Concluída | `DELETE /tasks/{id}` |
| US-006 | Autenticação mínima via API Key | [us-006-autenticacao-api-key.md](./us-006-autenticacao-api-key.md) | Transversal | ✅ Concluída | `ApiKeyGuard` (`x-api-key`) |
| US-007 | Padronizar respostas de erro | [us-007-padronizar-erros.md](./us-007-padronizar-erros.md) | Transversal | ✅ Concluída | `AllExceptionsFilter` (`ErrorResponse`) |

## Dependências entre USs

- **US-006** e **US-007** são pré-requisitos transversais para todas as demais.
- **US-001** é fundacional – cria a entidade Task e a persistência.
- **US-003**, **US-004** e **US-005** dependem de tasks existentes (criadas via US-001).
- **US-002** depende de dados existentes para paginação significativa.

## Ordem de implementação recomendada

1. US-007 (ErrorResponse) → 2. US-006 (API Key Guard) → 3. US-001 (Criar) → 4. US-003 (Consultar) → 5. US-002 (Listar) → 6. US-004 (Atualizar) → 7. US-005 (Remover)
