# error-handling Specification

## Purpose

Respostas de erro padronizadas com schema `ErrorResponse` contendo `code`, `message` e `details` opcional. Cobre US-007.

## Requirements

### Requirement: Formato padronizado de erro
O sistema SHALL retornar todas as respostas de erro no formato `ErrorResponse`. A spec OpenAPI MUST definir o schema `ErrorResponse` com `code` (string, obrigatório), `message` (string, obrigatório) e `details` (array, opcional), e o `AllExceptionsFilter` global MUST serializar qualquer exceção da aplicação no mesmo formato.

#### Scenario: Schema ErrorResponse definido
- **WHEN** a spec OpenAPI é validada
- **THEN** `components.schemas.ErrorResponse` MUST conter `code` (string, required), `message` (string, required) e `details` (array of objects, optional)

#### Scenario: ErrorResponse referenciado em respostas 4xx/5xx
- **WHEN** a spec OpenAPI é validada
- **THEN** todas as respostas 400, 401, 403, 404 e 500 em todos os paths MUST referenciar `$ref: '#/components/schemas/ErrorResponse'`

#### Scenario: Interceptação global e resposta padronizada
- **WHEN** qualquer exceção (`DomainException`, `HttpException` ou `Error` genérico) é lançada durante o processamento de uma requisição
- **THEN** o sistema responde com payload JSON contendo obrigatoriamente `code` e `message`, e opcionalmente `details`

### Requirement: Códigos de erro padronizados
O sistema SHALL utilizar códigos de erro padronizados e consistentes em todas as respostas de erro. Os códigos são strings UPPER_SNAKE_CASE identificando o tipo de erro.

#### Scenario: Código VALIDATION_ERROR
- **WHEN** os dados de entrada falham na validação (título curto, status inválido, page negativo)
- **THEN** o `ErrorResponse` contém `code` = `VALIDATION_ERROR` e `details` com lista de campos com erro

#### Scenario: Código TASK_NOT_FOUND
- **WHEN** uma tarefa não é encontrada pelo ID (inexistente ou soft-deleted)
- **THEN** o `ErrorResponse` contém `code` = `TASK_NOT_FOUND`

#### Scenario: Código UNAUTHORIZED
- **WHEN** o header `x-api-key` está ausente
- **THEN** o `ErrorResponse` contém `code` = `UNAUTHORIZED`

#### Scenario: Código INVALID_API_KEY
- **WHEN** o header `x-api-key` contém valor inválido
- **THEN** o `ErrorResponse` contém `code` = `INVALID_API_KEY`

#### Scenario: Código INTERNAL_SERVER_ERROR
- **WHEN** ocorre um erro inesperado no servidor
- **THEN** o `ErrorResponse` contém `code` = `INTERNAL_SERVER_ERROR` e HTTP 500

### Requirement: Exemplos concretos na spec
A spec OpenAPI MUST incluir exemplos concretos (`example`) em cada resposta de erro para facilitar integração por consumidores.

#### Scenario: Exemplos em respostas de erro
- **WHEN** a spec OpenAPI é validada
- **THEN** cada resposta 4xx/5xx MUST conter um bloco `example` com valores realistas de `code`, `message` e opcionalmente `details`
