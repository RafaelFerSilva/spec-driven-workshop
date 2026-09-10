## Context

O projeto possui a base NestJS configurada (bootstrap arquivado) e 7 User Stories documentadas. Esta change cria o contrato OpenAPI **antes** do código de negócio — abordagem spec-first. O arquivo `openapi.yaml` será a fonte de verdade para Swagger, validação de implementação e alinhamento entre PO/QA/dev.

A stack já suporta Swagger via `@nestjs/swagger` + `@fastify/swagger-ui` em `/api/docs`. Atualmente, o Swagger reflete apenas a estrutura vazia do `AppModule`. Após esta change, o arquivo OpenAPI poderá ser carregado diretamente ou os DTOs/controllers poderão ser anotados para gerar a spec programaticamente.

## Goals / Non-Goals

**Goals:**
- Arquivo `openapi.yaml` na raiz com spec OpenAPI 3.0.3 completa e validada
- 6 schemas formalizando contratos de entrada/saída/erro
- 5 paths com todos os status codes (sucesso + erro) e exemplos concretos
- Segurança global via `ApiKeyAuth`
- Rastreabilidade US → endpoint via `x-us-id`
- Decisões de negócio formalizadas (soft delete, paginação 0-based, 401 vs 403)

**Non-Goals:**
- Implementar controllers, use cases ou qualquer código em `src/`
- Criar schema de banco (tabelas Drizzle) — pertence à US-001
- Configurar validação automática de requests contra a spec (pode ser feito depois)
- Definir testes — pertencem às etapas 3–9

## Decisions

### D-001: OpenAPI 3.0.3 (vs 3.1.0)

**Escolha**: OpenAPI 3.0.3.

**Alternativas**: OpenAPI 3.1.0 (alinhado com JSON Schema draft 2020-12).

**Racional**: `@nestjs/swagger` 12 usa internamente OpenAPI 3.0.x. Usar 3.1.0 exigiria conversão manual ou configuração adicional. 3.0.3 é o formato nativo do tooling instalado.

### D-002: Arquivo estático na raiz (vs geração programática)

**Escolha**: Arquivo `openapi.yaml` na raiz do projeto, escrito manualmente nesta etapa.

**Alternativas**: Gerar a spec a partir de decorators nos controllers (`@ApiOperation`, `@ApiResponse`).

**Racional**: Na abordagem spec-first, o contrato precede o código. O arquivo YAML é a fonte de verdade. Na implementação (etapas seguintes), os decorators nos DTOs/controllers serão consistentes com este contrato, e o Swagger pode ser alimentado pelo arquivo estático ou pela geração automática — a spec YAML valida ambos.

### D-003: Soft delete com `deletedAt` (vs hard delete)

**Escolha**: Soft delete — campo `deletedAt` (date-time nullable) no schema `Task`.

**Alternativas**: Hard delete (remoção física do registro).

**Racional**: O workshop define explicitamente soft delete na Etapa 2. Soft delete oferece audit trail, possibilidade de restauração, e filtragem natural na listagem (`WHERE deletedAt IS NULL`). O campo `deletedAt` não aparece nas respostas de `GET /tasks` e `GET /tasks/{id}` — tarefas soft-deleted se comportam como inexistentes para o consumidor.

### D-004: API Key ausente → 401, inválida → 403

**Escolha**: Ausência de `x-api-key` → HTTP 401 (Unauthorized); chave inválida → HTTP 403 (Forbidden).

**Alternativas**: 403 para ambos os casos.

**Racional**: RFC 7235 define 401 como "credenciais ausentes ou insuficientes" e 403 como "credenciais presentes mas sem permissão". A distinção é útil para debugging do consumidor: 401 diz "esqueceu a chave", 403 diz "chave errada".

### D-005: Paginação 0-based

**Escolha**: `page` começa em 0 (default), `pageSize` default 10, máximo 100.

**Racional**: Alinhado com US-002. Zero-based é natural para cálculos de offset no banco (`OFFSET = page * pageSize`).

### D-006: Timestamps em ISO 8601 UTC

**Escolha**: Todos os campos de data (`createdAt`, `updatedAt`, `deletedAt`) usam `format: date-time` (ISO 8601 UTC).

**Racional**: Padrão OpenAPI, legível, sem ambiguidade de timezone.

### D-007: Prefixo `/api` nos paths

**Escolha**: Todos os paths usam prefixo `/api` (ex: `/api/tasks`).

**Racional**: O `main.ts` já configura `app.setGlobalPrefix('api')`. O Swagger está em `/api/docs`. Os paths na spec refletem as URLs finais que o consumidor usa.

## Risks / Trade-offs

- **[Drift spec ↔ código]** → A spec YAML é estática. Se a implementação divergir, o drift precisa ser detectado por testes ou validação manual. Mitigação: as etapas 3–9 devem validar cada endpoint contra a spec.
- **[`deletedAt` exposto no schema]** → O campo `deletedAt` existe no schema `Task` mas nunca é retornado em respostas normais (tarefas deletadas retornam 404). Isso pode causar confusão. Mitigação: documentar no schema que o campo é interno e nullable.
- **[Sem versionamento de API]** → A spec não define versão de path (ex: `/api/v1/tasks`). Para o MVP isso é aceitável. Mitigação: se necessário, adicionar versionamento via header ou path em versão futura.
