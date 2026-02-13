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

## Dados Mock (Desenvolvimento)

```javascript
const mockAlunos = [
  {
    id: 1,
    nome: 'João Silva',
    idade: 8,
    nivel: 'intermediario',
    pontos_totais: 850,
    ultima_atividade: '2026-02-12',
    avatar: '👦'
  },
  // ... mais alunos
];

const mockProgresso = [
  {
    jogo: 'Cyber Runner',
    acertos: 45,
    erros: 12,
    pontos: 450,
    tempo_medio: 120,
    data: '2026-02-12'
  },
  // ... mais dados
];
```

## API Endpoints (Futuros)

```
GET    /api/alunos                    - Lista todos alunos
POST   /api/alunos                    - Adiciona novo aluno
GET    /api/alunos/:id                - Detalhes de um aluno
PUT    /api/alunos/:id                - Atualiza aluno
DELETE /api/alunos/:id                - Remove aluno

GET    /api/progresso/:alunoId        - Progresso de um aluno
GET    /api/progresso/:alunoId/:jogo  - Progresso em jogo específico

GET    /api/estatisticas/geral        - Estatísticas gerais
GET    /api/estatisticas/:alunoId     - Estatísticas de um aluno

POST   /api/relatorios/exportar       - Exporta relatório CSV
```

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
