## Why

Este repositório contém apenas documentação (User Stories, arquitetura, tutorial). Para iniciar o desenvolvimento das 7 USs do MVP de Task Management, é necessário criar a base técnica — projeto NestJS compilando, testes rodando, lint configurado e banco disponível.

Sem esse bootstrap, nenhuma US pode ser implementada. É o pré-requisito para todo trabalho subsequente.

## What Changes

- Inicialização do projeto NestJS 12 com Fastify 5 como HTTP engine
- TypeScript strict mode com path aliases (`@domain/`, `@adapters/`, `@shared/`, `@src/`, `@tests/`)
- Build com SWC via `unplugin-swc`
- Vitest configurado com 3 perfis: unit, integration e e2e
- ESLint flat config + Prettier (sem ponto-e-vírgula, aspas simples, 120 colunas)
- Docker Compose com PostgreSQL 15-alpine
- Drizzle ORM com `drizzle.config.ts` e módulo de banco NestJS
- Swagger (`@nestjs/swagger` + `@fastify/swagger`) com endpoint `/api/docs`
- Logger via `nestjs-pino` + `pino-pretty`
- Estrutura de diretórios Clean Architecture (`src/domain/`, `src/adapters/`, `src/shared/`)
- Arquivo `.env` / `.env.example` com variáveis de configuração
- Scripts pnpm: `dev`, `build`, `start`, `lint`, `test`, `test:cov`, `test:e2e`

## Capabilities

### New Capabilities

Nenhuma. Este é um enabler técnico (`skip_specs: true`) — não introduz comportamento observável na API.

### Modified Capabilities

Nenhuma.

## Impact

- **Novo projeto**: Cria a árvore `src/` com estrutura Clean Architecture vazia, `package.json`, configurações TypeScript/ESLint/Prettier/Vitest e Docker Compose.
- **Dependências**: ~25 dependências de produção (NestJS, Fastify, Drizzle, Pino, class-validator, etc.) e ~15 de desenvolvimento (Vitest, Supertest, ESLint, Prettier, SWC, etc.).
- **Infraestrutura**: Requer Docker para PostgreSQL local.
- **Sem impacto em APIs ou specs existentes**: Repositório está vazio — não há breaking changes.
