## 1. Domínio e DTOs

- [x] 1.1 Criar enum `ErrorCode` em `src/domain/constants/error-code.enum.ts` com os códigos da spec (`VALIDATION_ERROR`, `TASK_NOT_FOUND`, `UNAUTHORIZED`, `INVALID_API_KEY`, `INTERNAL_SERVER_ERROR`)
- [x] 1.2 Criar classe `DomainException` em `src/domain/exception/domain.exception.ts` com suporte a `code` (ErrorCode), `message`, `httpStatus` e `details` opcional
- [x] 1.3 Criar interfaces/classes `ErrorResponseDto` e `ErrorDetailDto` em `src/shared/dto/error-response.dto.ts` espelhando o schema OpenAPI

## 2. Exception Filter e Integração

- [x] 2.1 Implementar `AllExceptionsFilter` em `src/adapters/api/filters/all-exceptions.filter.ts` tratando `DomainException`, `HttpException` (com extração de validation details) e exceções genéricas (`INTERNAL_SERVER_ERROR`)
- [x] 2.2 Registrar `AllExceptionsFilter` globalmente em `src/app.module.ts` via provider `APP_FILTER`

## 3. Testes Unitários e Validação

- [x] 3.1 Criar testes unitários para `DomainException` em `src/domain/exception/domain.exception.spec.ts`
- [x] 3.2 Criar suíte de testes unitários para `AllExceptionsFilter` em `src/adapters/api/filters/all-exceptions.filter.spec.ts` cobrindo `DomainException`, `HttpException` (string e objeto/array de validação) e erro genérico
- [x] 3.3 Executar testes unitários com `pnpm test` e verificar compilação com `pnpm build`
