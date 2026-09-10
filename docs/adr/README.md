# Architecture Decision Records (ADR)

Registro das decisões técnicas e de negócio tomadas durante o projeto. Cada decisão documenta o contexto, a escolha feita, alternativas consideradas e a justificativa.

> **Convenção**: Novas decisões são numeradas sequencialmente (`D-NNN`) e referenciadas pela US ou etapa que as originou.

---

## Índice de Decisões

| # | Decisão | Escolha | Alternativa | Justificativa | US / Etapa |
|---|---|---|---|---|---|

> Decisões serão registradas conforme o desenvolvimento avança.

---

## Formato de novos ADRs

Ao registrar uma nova decisão, adicione uma linha à tabela:

```markdown
| D-NNN | [Título curto] | [Escolha feita] | [Alternativa descartada] | [Justificativa] | [US-NNN / Etapa] |
```

Para decisões complexas que exijam mais contexto, criar um arquivo individual `docs/adr/NNNN-titulo.md` com o formato:

```markdown
# ADR-NNNN: Título

## Status
Aceita / Substituída por ADR-MMMM / Depreciada

## Contexto
[Descrição do problema ou necessidade]

## Decisão
[O que foi decidido]

## Alternativas Consideradas
[Lista de alternativas e por que foram descartadas]

## Consequências
[Impactos positivos e negativos da decisão]
```
