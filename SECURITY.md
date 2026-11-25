# Política de segurança

## Versões suportadas

Só a versão mais recente da branch `main` (3.x) recebe correções.

## Como relatar uma vulnerabilidade

Não abra issue pública. Use **Security → Report a vulnerability** neste repositório, ou fale com o mantenedor pelo GitHub ([@Dev-HP](https://github.com/Dev-HP)). Inclua descrição, passos para reproduzir, versão (commit) e impacto. A confirmação de recebimento sai em até 7 dias.

Não teste com dados reais de crianças nem contra instalações de terceiros.

## O que o projeto já faz

| Área | Medida |
|---|---|
| Senhas | Hash scrypt (Werkzeug), mínimo de 10 caracteres |
| Sessão | JWT HS256 de 15 minutos; refresh token rotacionável, guardado como hash e enviado em cookie `HttpOnly` |
| Força bruta | Limite de tentativas em login (10/min, 50/h), cadastro (5/min, 20/h) e refresh (30/min) por IP |
| Isolamento | Toda rota de dados confere no servidor a organização do usuário; teste automatizado |
| Configuração | `APP_ENV` assume produção; a API não sobe sem `SECRET_KEY` aleatória de 32+ caracteres e `DATABASE_URL` |
| Navegador | CSP sem scripts inline no frontend; cabeçalhos de segurança na API e no nginx; sem fontes ou scripts de terceiros |
| Dados de crianças | Perfis pseudonimizados; partidas só são gravadas com consentimento válido; exportação e exclusão |
| Dependências | `npm audit` e `pip-audit` no CI, falhando em qualquer vulnerabilidade |

## Documentação

- Revisão de segurança, pendências e checklist de produção: [`docs/seguranca/REVISAO_SEGURANCA.md`](docs/seguranca/REVISAO_SEGURANCA.md)
- Requisitos de LGPD: [`docs/seguranca/LGPD.md`](docs/seguranca/LGPD.md)
