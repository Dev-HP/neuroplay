# Arquitetura de produto real do Neuroplay

**Status:** especificação de implementação v1.0  
**Posicionamento:** plataforma educacional de atividades lúdicas e acompanhamento pedagógico; não é diagnóstico, tratamento ou dispositivo médico nesta fase.

## Decisão de arquitetura

A implementação continuará na stack existente **Flask + SQLAlchemy + PostgreSQL + Redis + Celery + React**, porque ela já possui contratos de gameplay, testes, Dockerfile, CI e componentes de telemetria. A prioridade é concluir o que já foi iniciado, reduzir risco de migração e permitir que o produto real preserve os jogos existentes.

| Abordagem | Trade-offs | Custo | Complexidade de setup |
|---|---|---|---|
| **Manter Flask/PostgreSQL/Redis/Docker e publicar backend HTTPS** | Reaproveita código e pipelines; exige concluir autenticação, schema, deploy e operação | Infraestrutura variável; pode usar ambiente gerenciado de entrada, mas não há garantia de gratuidade para produção | Média |
| Migrar para uma plataforma full-stack gerenciada com autenticação e banco integrados | Menos operação inicial, mas exige reescrever API, modelos, autenticação e contratos de gameplay | Uso e hospedagem dependem do provedor | Alta |
| Rodar somente localmente com Docker Compose | Bom para desenvolvimento e validação, sem dependência imediata de provedor | Baixo | Baixa, mas não entrega produto público multiusuário |

A primeira opção é a escolhida para o código. A terceira será mantida como ambiente local reproducível. A publicação pública do backend exigirá uma conta/serviço de hospedagem e secrets que não existem no repositório; o código não deve fingir que GitHub Pages é um backend.

## Escopo funcional do produto v1

O produto real terá uma organização educacional, educadores, perfis de estudantes pseudonimizados, responsáveis, consentimentos, catálogo de atividades, sessões de gameplay, eventos agregados, progresso descritivo, relatórios por turma e auditoria. O aluno não precisa possuir login próprio com e-mail; o educador ou responsável autentica e o estudante usa um perfil pseudonimizado, reduzindo coleta direta.

A plataforma registrará o que aconteceu no jogo — atividade, duração, pontuação, acertos, erros, eventos agregados e versão — mas não converterá esses dados em diagnóstico, nível clínico ou previsão de transtorno. A interface exibirá descrições como “sessões concluídas”, “acertos por atividade” e “tempo de interação”, acompanhadas de contexto e limites.

## Modelo de dados mínimo

| Entidade | Finalidade | Proteções principais |
|---|---|---|
| `organizations` | Tenant escolar/educacional | Identificador próprio, status, timestamps UTC |
| `users` | Educadores, responsáveis e administradores | E-mail normalizado, senha hash, papel, status, último login |
| `organization_memberships` | Isolamento multi-tenant e RBAC | Unique por organização/usuário, papel explícito |
| `student_profiles` | Perfil da criança/adolescente | Pseudônimo, data de nascimento opcional/minimizada, organização |
| `guardian_links` | Relação responsável–estudante | Sem expor relação para outros tenants |
| `consents` | Consentimento versionado e revogável | Finalidade, versão, responsável, timestamp, evidência e status |
| `activities` | Catálogo de jogos e objetivos pedagógicos | Versão, status, finalidade e domínio trabalhado |
| `game_sessions` | Uma sessão de jogo | Idempotency key, estudante, atividade, versão, status |
| `game_events` | Eventos mínimos e agregados | Sem texto livre sensível; retenção e vinculação à sessão |
| `progress_summaries` | Métricas derivadas descritivas | Fonte, janela, método e ausência de claim clínico |
| `audit_events` | Segurança e governança | Ação, ator, tenant, recurso, timestamp e metadados redigidos |
| `refresh_tokens` | Sessões renováveis de adultos | Token armazenado apenas como hash, revogação e expiração |

## Autenticação e autorização

A API emitirá access token curto, refresh token rotacionável e sessão revogável. Senhas serão armazenadas com algoritmo de hash apropriado; tokens não serão gravados em `localStorage`. A autorização será verificada no servidor em cada recurso: o usuário precisa pertencer à organização e ter papel suficiente para a operação. O cliente não poderá escolher `organization_id` ou `student_id` para escapar do tenant.

A criação de perfil de estudante será feita por adulto autorizado. O acesso de criança será pseudonimizado e condicionado ao estado de consentimento aplicável. Não haverá credencial de demonstração no build de produção.

## Dados infantis e privacy by design

A implementação seguirá minimização, alta privacidade por padrão, transparência em linguagem clara, controle parental, consentimento específico quando aplicável, revogação, exportação, exclusão e retenção configurável. Não serão coletados dados clínicos, diagnóstico, CPF, localização, contatos sociais ou conteúdo livre do estudante no MVP.

A plataforma exibirá telas de consentimento para o responsável, manterá versão do texto aceito e bloqueará sincronização de gameplay identificável quando o consentimento necessário estiver ausente ou revogado. A operação de exclusão será auditada e deverá remover ou anonimizar eventos derivados conforme política definida.

## Contratos de API do MVP

| Método | Endpoint | Regra |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Cadastra adulto e inicia verificação/convite; não cria criança automaticamente |
| `POST` | `/api/v1/auth/login` | Autentica adulto e emite sessão real |
| `POST` | `/api/v1/auth/refresh` | Rotaciona refresh token |
| `POST` | `/api/v1/auth/logout` | Revoga sessão atual |
| `GET` | `/api/v1/me` | Retorna identidade e organizações autorizadas |
| `GET/POST` | `/api/v1/organizations` | Lista ou cria organização para usuário permitido |
| `GET/POST` | `/api/v1/students` | Lista ou cria perfil pseudonimizado dentro do tenant |
| `GET/POST` | `/api/v1/consents` | Consulta e registra consentimento versionado |
| `GET` | `/api/v1/activities` | Lista catálogo publicado |
| `POST` | `/api/v1/gameplay/sessions` | Cria sessão com idempotency key |
| `POST` | `/api/v1/gameplay/sessions/:id/complete` | Fecha sessão, valida payload e grava métricas |
| `GET` | `/api/v1/students/:id/progress` | Retorna progresso descritivo autorizado |
| `GET` | `/api/v1/audit-events` | Apenas administradores/auditores autorizados |
| `GET` | `/health` | Liveness/readiness sem dados pessoais |

Os endpoints legados permanecerão temporariamente com adaptadores de compatibilidade, mas serão marcados para remoção. Nenhum adaptador poderá reintroduzir dados demo no modo de produção.

## Critérios de aceite do MVP real

| Área | Critério verificável |
|---|---|
| Autenticação | Cadastro/login/logout/refresh funcionam contra banco e revogação invalida sessão |
| Tenant isolation | Testes provam que usuário de organização A não lê ou escreve estudantes de B |
| Consentimento | Gameplay identificável é bloqueado sem consentimento válido e revogação interrompe novas sincronizações |
| Gameplay | Reenvio da mesma idempotency key não duplica sessão nem pontuação |
| Dados | Nenhum fixture/demo é usado quando `APP_ENV=production` |
| Segurança | Secrets vêm do ambiente; respostas não vazam stack trace, senha ou token |
| UX | Login, criação de estudante, consentimento, jogo, sincronização e relatório têm loading, erro, vazio e sucesso |
| Operação | Migrações, backup, health/readiness e logs redigidos são documentados |
| Evidência | Claims da interface são descritivos; qualquer estudo posterior tem protocolo separado do produto |
