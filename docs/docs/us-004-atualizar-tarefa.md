# US-004 – Atualizar parcialmente uma tarefa

**Como** usuário autenticado  
**Eu quero** atualizar parcialmente uma tarefa existente  
**Para** corrigir informações ou alterar o status de execução

## Critérios de aceitação

1. Deve existir um endpoint HTTP para atualização parcial (PATCH `/tasks/{id}`).
2. O corpo da requisição deve permitir atualizar qualquer combinação de:
   - `title`
   - `description`
   - `status`
3. Campos não enviados devem permanecer inalterados.
4. Regras de validação:
   - `title`, se enviado, deve ter mínimo 3 caracteres e máximo 100.
   - `description`, se enviada, deve ter máximo 2000 caracteres.
   - `status`, se enviado, deve ser um dos valores válidos (`PENDING`, `IN_PROGRESS`, `DONE`).
5. Em caso de sucesso, a resposta deve retornar a Task atualizada, com:
   - `id`, `title`, `description`, `status`, `createdAt`, `updatedAt` (updatedAt deve refletir a última alteração).
6. Em caso de:
   - `id` inválido: HTTP 400 com `ErrorResponse`.
   - Task inexistente: HTTP 404 com `ErrorResponse` (`TASK_NOT_FOUND`).
   - Erro de validação: HTTP 400 com `ErrorResponse` (`VALIDATION_ERROR`).
7. Autenticação via API Key obrigatória.

## Notas de negócio

- Este endpoint será usado, por exemplo, para mover tarefas de `PENDING` → `IN_PROGRESS` → `DONE`.
- Não há, nesta versão, lógica de negócio complexa (ex.: impedir mudança de DONE para PENDING).
