# api-key-auth Specification

## Purpose

Autenticação mínima via API Key no header `x-api-key` — proteção global de todos os endpoints da API de tarefas. Cobre US-006.

## Requirements

### Requirement: Segurança global via API Key
O sistema SHALL exigir autenticação via API Key em todos os endpoints da API de tarefas. A spec OpenAPI MUST definir `securitySchemes` com `ApiKeyAuth` (type `apiKey`, in `header`, name `x-api-key`) e aplicá-lo globalmente.

#### Scenario: Requisição com API Key válida
- **WHEN** o consumidor envia uma requisição com header `x-api-key` contendo uma chave válida
- **THEN** o sistema processa a requisição normalmente

#### Scenario: API Key ausente
- **WHEN** o consumidor envia uma requisição sem o header `x-api-key`
- **THEN** o sistema retorna HTTP 401 (Unauthorized) com `ErrorResponse` contendo `code` = `UNAUTHORIZED`

#### Scenario: API Key inválida
- **WHEN** o consumidor envia uma requisição com header `x-api-key` contendo uma chave inválida
- **THEN** o sistema retorna HTTP 403 (Forbidden) com `ErrorResponse` contendo `code` = `INVALID_API_KEY`

### Requirement: SecuritySchemes na spec OpenAPI
A spec OpenAPI MUST definir o componente `securitySchemes` com `ApiKeyAuth` e aplicar `security` globalmente para que todos os endpoints herdem a exigência de autenticação.

#### Scenario: Definição de securitySchemes
- **WHEN** a spec OpenAPI é validada
- **THEN** `components.securitySchemes.ApiKeyAuth` MUST existir com `type: apiKey`, `in: header`, `name: x-api-key`

#### Scenario: Security global aplicada
- **WHEN** a spec OpenAPI é validada
- **THEN** o campo `security` de nível raiz MUST conter `[{ ApiKeyAuth: [] }]`
