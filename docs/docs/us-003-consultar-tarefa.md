# US-003 – Consultar detalhes de uma tarefa

**Como** usuário autenticado  
**Eu quero** consultar os detalhes de uma tarefa específica a partir de seu ID  
**Para** ver informações completas e confirmar o status atual daquela tarefa

## Critérios de aceitação

1. Deve existir um endpoint HTTP para obter detalhes de uma task (GET `/tasks/{id}`).
2. O parâmetro `{id}` deve ser um UUID válido; se não for válido, retornar:
   - HTTP 400
   - `ErrorResponse` com detalhes do erro.
3. Em caso de sucesso, a resposta deve conter:
   - `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`
4. Se a tarefa não existir, o endpoint deve retornar:
   - HTTP 404
   - `ErrorResponse` com `code` = `TASK_NOT_FOUND` (ou equivalente) e mensagem clara.
5. Autenticação via API Key obrigatória; sem chave ou chave inválida deve retornar 401/403.

## Notas de negócio

- A consulta é apenas leitura; não há side-effect.
- Em futuras versões, podemos incluir metadados adicionais (quem criou, histórico de mudanças).
