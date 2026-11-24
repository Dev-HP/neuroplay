# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [3.0.0] - 2026-11-24

### Adicionado
- Modo demonstração: o GitHub Pages funciona sem servidor, com as rotas da API atendidas no navegador.
- Controles na tela (toque/mouse) e botão "Encerrar" nos jogos em canvas.
- Nova logo (laço de infinito com botão "play") e paleta de baixa saturação.
- Análise científica dos jogos (`docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md`), auditoria de UX/código e teste prático.

### Alterado
- Mestres do Sinal segue o paradigma Go/No-Go clássico: bloco de 20 sinais, 75% Go, omissões e comissões medidas.
- Jogos reunidos em `frontend/src/games/<Nome>/`; dificuldade adaptativa em `shared/adaptation/`.
- Documentação reorganizada por assunto (`docs/produto`, `arquitetura`, `pesquisa`, `jogos`, `guias`, `qualidade`, `seguranca`, `marca`, `historico`).
- Catálogo "Em breve": Jogo das Emoções e Peixinhos (Flanker) no lugar de Quebra-cabeça e Jogo da Memória.

### Corrigido
- Memória Dupla travava ao abrir e congelava a rodada a cada resposta.
- Jogos em canvas apagavam a partida a cada ponto; Templo dos Ecos e Sonic Jump eram impossíveis de vencer.
- Gravity Lab nunca encerrava; Templo dos Ecos somava pontos em dobro.
- CSS vazando entre telas (34 classes em conflito), botões cobertos e alvos de toque pequenos.
- Backend CI: driver psycopg2 fixado na URL do PostgreSQL.

### Removido
- Versões mortas do Cyber-Runner (DOM e canvas antigo); protótipos Pygame movidos para `legacy/` e `pygame` fora das dependências do backend.
- Arquivos vazios e relatórios de status antigos da raiz (movidos para `docs/historico/`).

## [2.5.0] - 2026-02-13

### ✨ Adicionado
- **Detector de Cascata de Erros**: Sistema inteligente que detecta 4+ erros consecutivos e sugere pausas
- **Painel do Educador Completo**: Dashboard com métricas, gráficos e gestão de alunos
- **Sistema de Design Unificado**: Variáveis CSS e componentes reutilizáveis
- **Medição de Latência da IA**: Tracking de performance com estatísticas detalhadas
- **Animações Suaves**: Feedback visual aprimorado com Framer Motion

### 🔄 Modificado
- **Migração para Design System**: Todos os jogos agora usam variáveis CSS centralizadas
- **Performance de IA**: Otimizações resultando em <50ms de latência em 95% dos casos
- **Responsividade**: Melhorias em mobile e tablet para todos os componentes

### 🐛 Corrigido
- Erros de compilação em workflows do GitHub Actions
- Problemas de compatibilidade com Node.js 20
- Vazamentos de memória em jogos com Three.js
- Problemas de navegação em telas pequenas

### 🔒 Segurança
- Atualização de dependências com vulnerabilidades
- Implementação de rate limiting no backend
- Sanitização de inputs do usuário
- Headers de segurança configurados

## [2.0.0] - 2025-11-20

### ✨ Adicionado
- Sistema de autenticação completo (JWT)
- 3 jogos principais implementados
- Integração com banco de dados PostgreSQL
- Sistema de pontuação e progresso
- Painel básico do aluno

### 🔄 Modificado
- Migração de Python 3.9 para 3.11
- Atualização React 17 → 18
- Refatoração da arquitetura backend (Clean Architecture)

## [1.0.0] - 2025-08-15

### ✨ Adicionado
- Primeira versão funcional
- Jogo piloto: Mestres do Sinal
- Interface básica de autenticação
- Estrutura de projeto inicial

---

## Tipos de Mudanças

- `✨ Adicionado` - Novas funcionalidades
- `🔄 Modificado` - Mudanças em funcionalidades existentes
- `❌ Removido` - Funcionalidades removidas
- `🐛 Corrigido` - Correções de bugs
- `🔒 Segurança` - Correções de vulnerabilidades
- `📝 Documentação` - Mudanças apenas em documentação
- `🎨 Estilo` - Mudanças que não afetam o código (formatação, etc)
- `♻️ Refatoração` - Mudanças de código que não corrigem bugs nem adicionam funcionalidades
- `⚡ Performance` - Melhorias de performance
- `✅ Testes` - Adição ou correção de testes
