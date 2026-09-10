## 1. Inicialização do Projeto

- [x] 1.1 Inicializar projeto NestJS 12 com pnpm (`@nestjs/cli new` ou scaffold manual) usando Fastify como HTTP engine
- [x] 1.2 Configurar `tsconfig.json` com strict mode, ES2022, NodeNext, decorators e path aliases (`@domain/`, `@adapters/`, `@shared/`, `@src/`, `@tests/`)
- [x] 1.3 Configurar `tsconfig.build.json` excluindo testes e diretórios não-compiláveis
- [x] 1.4 Criar `.swcrc` com `legacyDecorator: true` e `emitDecoratorMetadata: true` para compatibilidade NestJS
- [x] 1.5 Configurar `nest-cli.json` com SWC como builder via `unplugin-swc`

## 2. Estrutura Clean Architecture

- [x] 2.1 Criar a árvore de diretórios em `src/domain/` (`model/`, `exception/`, `port/repositories/`, `usecase/`, `constants/`, `validators/`)
- [x] 2.2 Criar a árvore de diretórios em `src/adapters/` (`api/controllers/`, `api/dto/`, `api/filters/`, `api/guards/`, `api/pipes/`, `api/interceptors/`, `database/drizzle/`, `modules/`, `repositories/`)
- [x] 2.3 Criar o diretório `src/shared/`
- [x] 2.4 Criar o `AppModule` mínimo em `src/app.module.ts`
- [x] 2.5 Criar `src/main.ts` com `NestFactory.create<NestFastifyApplication>` usando `FastifyAdapter`

## 3. Lint e Formatação

- [x] 3.1 Configurar Prettier (`.prettierrc`) — sem ponto-e-vírgula, aspas simples, 120 colunas, trailing comma es5
- [x] 3.2 Configurar ESLint flat config (`eslint.config.js`) com `typescript-eslint` e `prettier`
- [x] 3.3 Adicionar scripts `lint` e `format` ao `package.json`

## 4. Sistema de Testes

- [x] 4.1 Instalar Vitest, Supertest e `unplugin-swc`
- [x] 4.2 Criar `vitest.config.ts` com resolução de path aliases e plugin SWC
- [x] 4.3 Criar `vitest.unit.ts` — testes `*.spec.ts` em `src/`
- [x] 4.4 Criar `vitest.integration.ts` — testes `*.integration.spec.ts` em `tests/integration/`
- [x] 4.5 Criar `vitest.e2e.ts` — testes `*.e2e-spec.ts` em `tests/e2e/`
- [x] 4.6 Adicionar scripts `test`, `test:cov`, `test:e2e` e `test:integration` ao `package.json`
- [x] 4.7 Criar diretórios `tests/e2e/` e `tests/integration/` com arquivos `.gitkeep`

## 5. Banco de Dados

- [x] 5.1 Criar `docker-compose.yml` com PostgreSQL 15-alpine (porta 5435, db `taskmanager`)
- [x] 5.2 Criar `.env` e `.env.example` com variáveis de configuração (`DATABASE_URL`, `API_KEY`, `PORT`)
- [x] 5.3 Instalar Drizzle ORM (`drizzle-orm`, `pg`, `drizzle-kit`)
- [x] 5.4 Criar `drizzle.config.ts` apontando para `src/adapters/database/drizzle/schema.ts`
- [x] 5.5 Criar `DrizzleModule` global em `src/adapters/database/drizzle/` com provider `DRIZZLE` injetável
- [x] 5.6 Criar arquivo de schema vazio em `src/adapters/database/drizzle/schema.ts`
- [x] 5.7 Adicionar script `db:migrate` ao `package.json`

## 6. Swagger

- [x] 6.1 Instalar `@nestjs/swagger`, `@fastify/swagger` e `@fastify/swagger-ui`
- [x] 6.2 Configurar `SwaggerModule` em `main.ts` com endpoint `/api/docs`

## 7. Logger

- [x] 7.1 Instalar `nestjs-pino` e `pino-pretty`
- [x] 7.2 Registrar `LoggerModule` no `AppModule` e substituir o logger padrão do NestJS

## 8. Configuração Final

- [x] 8.1 Criar `.gitignore` com `node_modules/`, `dist/`, `.env`, `coverage/`, `drizzle/meta/`
- [x] 8.2 Adicionar scripts de desenvolvimento: `dev` (`nest start --watch`), `start`, `build`

## 9. Validação

- [x] 9.1 Executar `pnpm lint` — 0 erros
- [x] 9.2 Executar `pnpm build` — compilação sem erros
- [x] 9.3 Executar `pnpm test` — sem falhas (pode ser 0 testes encontrados, mas sem erros de config)
- [x] 9.4 Verificar que `docker compose up -d` sobe o PostgreSQL
- [x] 9.5 Verificar que `pnpm dev` inicia o servidor e `/api/docs` responde
