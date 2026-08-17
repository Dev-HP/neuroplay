# Especificação: Painel do Educador - NeuroPlay 2.5

## Visão Geral
Painel completo e profissional para educadores acompanharem o progresso de alunos com TEA através de métricas, gráficos e relatórios detalhados.

## Funcionalidades

### 1. Dashboard Geral
**Objetivo:** Visão panorâmica de todos os alunos

**Componentes:**
- 4 Cards de Métricas:
  - Total de Alunos
  - Alunos Ativos (últimos 7 dias)
  - Pontos Totais Acumulados
  - Média de Pontos por Aluno

- Gráfico de Barras: Desempenho por Aluno (top 5)
- Gráfico de Pizza: Distribuição por Nível (iniciante/intermediário/avançado)
- Lista de Atividade Recente (últimas 5 ações)

### 2. Gestão de Alunos
**Objetivo:** Adicionar, visualizar e gerenciar alunos

**Componentes:**
- Botão "Adicionar Aluno" (modal)
- Grid de Cards de Alunos:
  - Avatar
  - Nome e Idade
  - Nível (badge colorido)
  - Pontos Totais
  - Última Atividade
  - Botão "Ver Detalhes"

**Modal Adicionar Aluno:**
- Campo: Nome (obrigatório)
- Campo: Idade (número)
- Select: Nível (iniciante/intermediário/avançado)
- Botão: Salvar / Cancelar

### 3. Relatórios Detalhados
**Objetivo:** Análise profunda do desempenho individual

**Componentes:**
- Seletor de Aluno
- 5 Cards de Métricas do Aluno:
  - Pontos Totais
  - Taxa de Acerto
  - Total de Acertos
  - Total de Erros
  - Tempo Médio por Jogo

- Gráfico de Barras: Desempenho por Jogo
- Gráfico de Linha: Evolução ao Longo do Tempo
- Tabela Detalhada: Histórico de Jogadas
- Botão: Exportar Relatório (CSV)

**Filtros:**
- Por Jogo (todos/cyber runner/echo temple/etc)
- Por Período (7 dias/30 dias/todo período)

### 4. Configurações
**Objetivo:** Personalizar experiência dos alunos

**Componentes:**
- Configurações de Dificuldade:
  - Velocidade dos jogos
  - Complexidade dos desafios
  - Tempo limite

- Configurações de Metas:
  - Pontos diários
  - Tempo de jogo recomendado
  - Conquistas a desbloquear

- Configurações de Notificações:
  - Email ao atingir metas
  - Alertas de inatividade
  - Relatórios semanais

## Design System

### Cores
```css
--educator-primary: #667eea;
--educator-secondary: #764ba2;
--educator-success: #48bb78;
--educator-warning: #ed8936;
--educator-error: #f56565;
--educator-info: #4299e1;
```

### Tipografia
- Títulos: Inter, 600-700 weight
- Corpo: Inter, 400-500 weight
- Tamanhos: 14px (corpo), 16px (subtítulos), 24px+ (títulos)

### Espaçamento
- Grid: 24px gap
- Cards: 20px padding
- Sections: 32px margin-bottom

### Componentes

#### Card
```css
background: white;
border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.08);
padding: 20px;
transition: transform 0.2s, box-shadow 0.2s;

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}
```

#### Button Primary
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
border: none;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
cursor: pointer;
transition: transform 0.2s, box-shadow 0.2s;

&:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
```

#### Stat Card
```css
display: flex;
align-items: center;
gap: 16px;
padding: 24px;
border-radius: 12px;
background: linear-gradient(135deg, color1, color2);
color: white;

.stat-icon {
  font-size: 48px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
}
```

### Animações
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

## Responsividade

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Adaptações Mobile
- Grid de 4 colunas → 1 coluna
- Sidebar colapsável
- Gráficos com scroll horizontal
- Botões full-width

## Acessibilidade

### WCAG 2.1 AA
- Contraste mínimo 4.5:1
- Navegação por teclado
- Labels em todos inputs
- ARIA labels em ícones
- Focus visível em todos elementos interativos

### Feedback Visual
- Loading states
- Success/error messages
- Tooltips informativos
- Confirmações de ações

## Fonte de dados do painel

Os arrays de alunos e progresso usados em versões demonstrativas foram removidos do runtime e não devem ser reintroduzidos. O painel consulta exclusivamente a API autenticada, com `X-Organization-ID`, escopo por organização e estados explícitos de carregamento, vazio e erro. O estudante é criado por adulto autorizado e aparece de forma pseudonimizada.

## API Endpoints implementados

```text
POST   /api/v1/auth/register                    - Cadastra o adulto e a organização inicial
POST   /api/v1/auth/login                       - Autentica o adulto
POST   /api/v1/auth/refresh                     - Rotaciona o refresh token
POST   /api/v1/auth/logout                      - Revoga a sessão atual
GET    /api/v1/me                               - Identidade e organizações autorizadas
GET    /api/v1/students                         - Lista estudantes do tenant atual
POST   /api/v1/students                         - Cria perfil pseudonimizado
GET    /api/v1/students/{id}/progress           - Progresso descritivo autorizado
GET    /api/v1/consents                         - Consulta consentimentos
POST   /api/v1/consents                         - Registra consentimento versionado
POST   /api/v1/consents/{id}/revoke             - Revoga consentimento
GET    /api/v1/activities                       - Catálogo de atividades
POST   /api/v1/gameplay/sync                    - Persiste sessão idempotente
GET    /api/v1/students/{id}/export             - Exporta dados autorizados
DELETE /api/v1/students/{id}                    - Solicita exclusão lógica
GET    /api/v1/audit-events                     - Auditoria para papel autorizado
```

O Painel Educador usa esses contratos para registrar consentimento, acompanhar estudantes reais do tenant, exportar CSV derivado da resposta autorizada e impedir o início de gameplay identificável sem perfil e consentimento válidos.

## Testes

### Unitários
- Cálculo de estatísticas
- Formatação de dados
- Validação de formulários

### Integração
- Carregamento de dados
- Criação de alunos
- Exportação de relatórios

### E2E
- Fluxo completo: adicionar aluno → ver relatório → exportar
- Navegação entre tabs
- Responsividade

## Performance

### Otimizações
- Lazy loading de gráficos
- Virtualização de listas longas
- Debounce em filtros
- Cache de dados com React Query

### Métricas Alvo
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

---

**Status:** 📝 Especificação Completa
**Próximo Passo:** Implementação do componente
