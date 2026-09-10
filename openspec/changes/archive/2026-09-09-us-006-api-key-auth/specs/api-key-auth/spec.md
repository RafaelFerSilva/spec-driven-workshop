## MODIFIED Requirements

### Requirement: Segurança global via API Key
O sistema SHALL exigir autenticação via API Key em todos os endpoints da API de tarefas por padrão através de um guard global (`ApiKeyGuard`), permitindo que rotas públicas sejam explicitamente liberadas através do decorator `@Public()`. A spec OpenAPI MUST definir `securitySchemes` com `ApiKeyAuth` (type `apiKey`, in `header`, name `x-api-key`) e aplicá-lo globalmente.

#### Scenario: Requisição com API Key válida
- **WHEN** o consumidor envia uma requisição com header `x-api-key` contendo uma chave válida
- **THEN** o sistema processa a requisição normalmente

#### Scenario: API Key ausente
- **WHEN** o consumidor envia uma requisição sem o header `x-api-key` em rota protegida
- **THEN** o sistema retorna HTTP 401 (Unauthorized) com `ErrorResponse` contendo `code` = `UNAUTHORIZED`

#### Scenario: API Key inválida
- **WHEN** o consumidor envia uma requisição com header `x-api-key` contendo uma chave inválida em rota protegida
- **THEN** o sistema retorna HTTP 403 (Forbidden) com `ErrorResponse` contendo `code` = `INVALID_API_KEY`

#### Scenario: Rota pública com decorator @Public
- **WHEN** uma requisição é enviada para uma rota decorada com `@Public()`, mesmo sem header `x-api-key`
- **THEN** o sistema libera o acesso sem exigir autenticação
