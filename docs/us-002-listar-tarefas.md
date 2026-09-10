# US-002 – Listar tarefas com paginação

**Como** usuário autenticado  
**Eu quero** listar minhas tarefas com paginação  
**Para** visualizar o conjunto de tarefas de forma organizada e evitar respostas muito grandes

## Critérios de aceitação

1. Deve existir um endpoint HTTP para listagem de tarefas (GET `/tasks`).
2. A listagem deve suportar paginação com parâmetros de query:
   - `page` (inteiro, 0-based, opcional; default 0)
   - `pageSize` (inteiro, opcional; default 10, máximo 100)
3. A resposta deve conter:
   - `items`: array de tarefas
   - `total`: número total de tarefas disponíveis
   - `page`: página atual
   - `pageSize`: tamanho da página atual
4. Cada item em `items` deve seguir o mesmo contrato da entidade Task:
   - `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`
5. Se `page` ou `pageSize` forem inválidos (ex.: negativos, acima do máximo), a API deve retornar:
   - HTTP 400
   - Corpo com `ErrorResponse` contendo `code` e `message`.
6. O endpoint deve ser protegido por autenticação via API Key (header `x-api-key`).
7. Futuro: possibilidade de filtro por `status` (não obrigatório no MVP, mas pode ser documentado como evolução em spec).

## Notas de negócio

- Por enquanto, as tarefas não são filtradas por usuário em termos de modelo; assumimos uma API Key por "cliente" que vê seu conjunto de tasks.
- Em versões futuras, pode haver associação explícita a usuários com multi-tenant.
