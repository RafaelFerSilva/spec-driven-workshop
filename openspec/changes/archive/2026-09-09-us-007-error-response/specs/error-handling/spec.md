## MODIFIED Requirements

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
