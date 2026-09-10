# US-001 – Criar tarefa

**Como** usuário autenticado da API  
**Eu quero** criar uma tarefa com título, descrição opcional e status  
**Para** registrar atividades que preciso executar e acompanhar

## Critérios de aceitação

1. Deve existir um endpoint HTTP para criação de tarefa (POST `/tasks`).
2. O título (`title`) é obrigatório e deve ter no mínimo 3 caracteres e no máximo 100.
3. A descrição (`description`) é opcional e pode ter até 2000 caracteres.
4. O status (`status`) é opcional. Caso não seja informado, o valor padrão deve ser `PENDING`.
5. Status válidos são: `PENDING`, `IN_PROGRESS`, `DONE`. Qualquer outro valor deve resultar em erro de validação.
6. A resposta de sucesso deve retornar:
   - `id` (UUID)
   - `title`
   - `description` (se existir)
   - `status`
   - `createdAt`
   - `updatedAt`
7. Em caso de erro de validação (ex.: título muito curto, status inválido), a API deve retornar:
   - HTTP 400
   - Corpo com um objeto de erro contendo pelo menos `code` e `message`.
8. O endpoint deve exigir autenticação básica via API Key (header `x-api-key` válido); sem chave ou chave inválida deve retornar erro 401 ou 403.

## Notas de negócio

- A criação de tarefas é a base do sistema; deve ser simples e previsível.
- Não há, por enquanto, campo de prioridade ou categoria.
- A criação deve ser idempotente apenas em relação ao corpo da requisição? (por ora, não exigimos idempotência extra; uma mesma requisição pode gerar múltiplas tasks).
