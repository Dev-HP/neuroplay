# Arquitetura da Plataforma NeuroPlay

## Visão Geral

A plataforma NeuroPlay é uma aplicação web full-stack desenvolvida para inclusão digital de crianças com TEA e TDAH através de jogos educativos gamificados.

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Login      │  │ Painel Aluno │  │Painel Educador│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Mestres Sinal │  │Quebra-cabeça │  │Jogo Memória  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                    API REST (JSON)
                            │
┌─────────────────────────────────────────────────────────┐
│                   BACKEND (Flask/Python)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Autenticação  │  │  Gamificação │  │  Relatórios  │  │
│  │    (JWT)     │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
                      SQLAlchemy ORM
                            │
┌─────────────────────────────────────────────────────────┐
│                 BANCO DE DADOS (PostgreSQL)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Usuario    │  │    Aluno     │  │  Atividade   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐                                       │
│  │  Progresso   │                                       │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## Componentes Principais

### Frontend (React)

**Páginas:**
- `Login.js`: Autenticação e cadastro de usuários
- `PainelAluno.js`: Dashboard do aluno com seleção de jogos
- `PainelEducador.js`: Dashboard do educador com relatórios e métricas
- `JogoMestresSinal.js`: Jogo de controle inibitório (Go/No-Go)

**Características:**
- Design minimalista e colorido
- Interface acessível para crianças com TEA/TDAH
- Gráficos interativos (Recharts)
- Navegação intuitiva (React Router)

### Backend (Flask/Python)

**Endpoints da API:**

```
POST /api/auth/register    - Cadastro de usuário
POST /api/auth/login       - Login e geração de token JWT
GET  /api/alunos           - Lista alunos do educador
GET  /api/progresso/:id    - Progresso de um aluno
POST /api/progresso        - Salvar progresso de atividade
GET  /api/atividades       - Lista todas as atividades
```

**Segurança:**
- Autenticação JWT
- Senhas criptografadas (Werkzeug)
- CORS configurado
- Validação de dados

### Banco de Dados (PostgreSQL)

**Modelo de Dados:**

```
Usuario (id, nome, email, senha, tipo, data_criacao)
    │
    ├─── Aluno (id, usuario_id, educador_id, pontos_totais, nivel)
    │       │
    │       └─── Progresso (id, aluno_id, atividade_id, pontos, tempo_gasto, acertos, erros)
    │
    └─── Atividade (id, nome, tipo, descricao, dificuldade)
```

## Fluxo de Dados

### Autenticação
1. Usuário envia credenciais
2. Backend valida e gera token JWT
3. Token armazenado no localStorage
4. Token enviado em todas as requisições subsequentes

### Jogo
1. Aluno inicia jogo
2. Frontend gerencia lógica do jogo
3. Ao finalizar, envia dados para backend
4. Backend salva progresso no banco
5. Atualiza pontos totais do aluno

### Relatórios
1. Educador seleciona aluno
2. Frontend requisita progresso
3. Backend busca dados no banco
4. Frontend renderiza gráficos e métricas

## Tecnologias Utilizadas

**Frontend:**
- React 18
- React Router DOM
- Axios (HTTP client)
- Recharts (gráficos)
- CSS3 (estilização)

**Backend:**
- Flask 3.0
- Flask-SQLAlchemy
- Flask-CORS
- PyJWT
- Werkzeug

**Banco de Dados:**
- PostgreSQL 12+

## Princípios de Design

1. **Minimalismo**: Interface limpa sem distrações
2. **Cores Vibrantes**: Coral, amarelo e azul para engajamento
3. **Acessibilidade**: Botões grandes, textos legíveis
4. **Feedback Imediato**: Animações e respostas visuais
5. **Gamificação**: Pontos, níveis e progresso visual

## Escalabilidade

A arquitetura permite:
- Adicionar novos jogos facilmente
- Expandir sistema de gamificação
- Implementar novos tipos de relatórios
- Integrar com APIs externas
- Deploy em cloud (AWS, Azure, Heroku)

## Próximos Passos

1. Implementar jogos Quebra-cabeça e Memória
2. Sistema de emblemas e conquistas
3. Ranking entre alunos
4. Exportação de relatórios em PDF
5. Modo offline com sincronização
6. Aplicativo mobile (React Native)
