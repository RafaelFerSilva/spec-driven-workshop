# US-005 – Remover uma tarefa

**Como** usuário autenticado  
**Eu quero** remover uma tarefa existente  
**Para** manter minha lista de tarefas organizada e livre de itens obsoletos

## Critérios de aceitação

1. Deve existir um endpoint HTTP para remoção de task (DELETE `/tasks/{id}`).
2. O parâmetro `{id}` deve ser um UUID válido.
3. Comportamento de remoção no MVP:
   - Pode ser **soft delete** (marcar como removida) ou **hard delete** (remover definitivamente).
   - O comportamento escolhido deve ser documentado na spec.
4. Em caso de sucesso:
   - A API deve retornar HTTP 204 (No Content).
5. Se a tarefa não existir:
   - A API deve retornar HTTP 404 com `ErrorResponse`.
6. Autenticação via API Key obrigatória.

## Notas de negócio

- Para o MVP, não há necessidade de histórico de exclusão; porém, podemos optar por soft delete pensando em futuro audit trail.
- A decisão de soft/hard delete deve ser alinhada com o PO e registrada na spec.
