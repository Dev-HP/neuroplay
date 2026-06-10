# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
