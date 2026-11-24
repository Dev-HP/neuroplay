# 🎨 NeuroPlay Design System

## Visão Geral

O NeuroPlay utiliza um design system moderno e acessível, otimizado para crianças e adultos com TEA (Transtorno do Espectro Autista). Seguimos princípios de design inclusivo, acessibilidade WCAG 2.1 AA e as melhores práticas de UX/UI.

---

## 🎯 Princípios de Design

### 1. **Clareza e Simplicidade**
- Interface limpa sem elementos distrativos
- Hierarquia visual clara
- Feedback visual imediato para todas as ações

### 2. **Consistência**
- Padrões visuais repetidos em toda a aplicação
- Comportamentos previsíveis
- Linguagem visual unificada

### 3. **Acessibilidade**
- Contraste adequado (WCAG AA)
- Suporte a leitores de tela
- Navegação por teclado
- Modo de movimento reduzido
- Alto contraste opcional

### 4. **Inclusividade**
- Design para neurodiversidade
- Elementos visuais amigáveis
- Feedback positivo e encorajador
- Sem elementos que causem sobrecarga sensorial

---

## 🎨 Paleta de Cores

### Cores Primárias
```css
--primary-500: #667eea  /* Roxo vibrante */
--primary-600: #5a67d8
--primary-700: #4c51bf
```

### Cores Secundárias
```css
--secondary-500: #764ba2  /* Roxo profundo */
--secondary-600: #6b3fa0
--secondary-700: #5d3589
```

### Cores de Acento
```css
--accent-pink: #f093fb    /* Rosa suave */
--accent-coral: #ff6b6b   /* Coral energético */
--accent-blue: #4facfe    /* Azul calmo */
--accent-green: #43e97b   /* Verde positivo */
--accent-yellow: #ffd93d  /* Amarelo alegre */
```

### Neutros
```css
--gray-50: #f7fafc   /* Fundo claro */
--gray-500: #718096  /* Texto secundário */
--gray-800: #1a202c  /* Texto principal */
```

### Cores Semânticas
```css
--success: #48bb78   /* Verde sucesso */
--warning: #ed8936   /* Laranja aviso */
--error: #f56565     /* Vermelho erro */
--info: #4299e1      /* Azul informação */
```

---

## 📐 Tipografia

### Fonte Principal
**Inter** - Fonte moderna, legível e otimizada para telas

### Hierarquia
- **H1**: 3rem (48px) - Títulos principais
- **H2**: 2.25rem (36px) - Seções
- **H3**: 1.875rem (30px) - Subsecções
- **H4**: 1.5rem (24px) - Cards
- **Body**: 1rem (16px) - Texto padrão
- **Small**: 0.875rem (14px) - Legendas

### Pesos
- **Regular**: 400 - Texto corpo
- **Medium**: 500 - Ênfase leve
- **Semibold**: 600 - Botões
- **Bold**: 700 - Destaque
- **Extrabold**: 800 - Títulos

---

## 🔲 Espaçamentos

Sistema baseado em múltiplos de 4px:

```css
--space-1: 0.25rem  (4px)
--space-2: 0.5rem   (8px)
--space-3: 0.75rem  (12px)
--space-4: 1rem     (16px)
--space-6: 1.5rem   (24px)
--space-8: 2rem     (32px)
--space-12: 3rem    (48px)
--space-16: 4rem    (64px)
```

---

## 🎭 Logo

### Conceito
O logo do NeuroPlay combina:
- **Cérebro estilizado**: Representa neurociência e aprendizado
- **Conexões neurais**: Sinapses animadas simbolizando atividade cerebral
- **Controlador de jogo**: Elemento lúdico representando diversão

### Variações
- **Com texto**: Para headers e branding
- **Apenas ícone**: Para favicons e espaços reduzidos
- **Animado**: Com pulsos neurais para engajamento
- **Estático**: Para impressão e contextos formais

### Cores do Logo
- Gradiente primário: `#667eea → #764ba2`
- Gradiente de acento: `#f093fb → #f5576c`

---

## 🎯 Componentes

### Botões

#### Primário
```css
background: linear-gradient(135deg, #667eea, #764ba2);
padding: 16px 32px;
border-radius: 16px;
font-weight: 700;
box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
```

**Estados:**
- Hover: Elevação aumentada
- Active: Elevação reduzida
- Disabled: Opacidade 50%
- Focus: Outline 4px

#### Secundário
```css
background: white;
border: 2px solid #667eea;
color: #667eea;
```

### Cards

```css
background: white;
border-radius: 24px;
padding: 2rem;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

**Hover:**
```css
transform: translateY(-12px) scale(1.02);
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
```

### Inputs

```css
padding: 16px 20px;
border: 2px solid #e2e8f0;
border-radius: 16px;
background: #f7fafc;
font-size: 16px;
```

**Focus:**
```css
border-color: #667eea;
background: white;
box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
```

---

## ✨ Animações

### Princípios
- **Propósito**: Toda animação tem uma função
- **Duração**: 150-500ms para microinterações
- **Easing**: Cubic-bezier para movimento natural
- **Respeito**: Suporte a `prefers-reduced-motion`

### Timing Functions
```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-bounce: 500ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Animações Principais
- **fadeInUp**: Entrada de elementos
- **pulse**: Atenção sutil
- **bounce**: Feedback positivo
- **shake**: Erro ou atenção
- **scale**: Hover em cards

---

## 📱 Responsividade

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px)

/* Tablet */
@media (max-width: 768px)

/* Desktop */
@media (max-width: 1024px)

/* Large Desktop */
@media (max-width: 1280px)
```

### Estratégia
- **Mobile First**: Design começa no mobile
- **Progressive Enhancement**: Adiciona recursos para telas maiores
- **Fluid Typography**: Tamanhos de fonte responsivos
- **Flexible Grids**: CSS Grid e Flexbox

---

## ♿ Acessibilidade

### Contraste
- Texto normal: Mínimo 4.5:1
- Texto grande: Mínimo 3:1
- Elementos interativos: Mínimo 3:1

### Navegação por Teclado
- Tab order lógico
- Focus visible em todos os elementos
- Skip links quando necessário
- Atalhos de teclado documentados

### Leitores de Tela
- ARIA labels em elementos interativos
- Landmarks semânticos
- Texto alternativo em imagens
- Anúncios de mudanças dinâmicas

### Modo de Alto Contraste
```css
@media (prefers-contrast: high) {
  /* Aumenta contraste */
  /* Adiciona bordas */
  /* Sublinha links */
}
```

### Movimento Reduzido
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎮 Microinterações

### Hover States
- Elevação de cards
- Mudança de cor em botões
- Escala de ícones
- Transição suave (300ms)

### Click/Tap Feedback
- Redução de escala momentânea
- Mudança de cor
- Ripple effect (opcional)
- Feedback tátil (mobile)

### Loading States
- Skeleton screens
- Spinners animados
- Progress bars
- Mensagens de status

### Success/Error States
- Animação de check/x
- Mudança de cor
- Mensagem clara
- Ação sugerida

---

## 📊 Gamificação

### Elementos
- **Estrelas**: Conquistas
- **Níveis**: Progressão
- **Badges**: Marcos especiais
- **Progresso**: Barras visuais

### Feedback Positivo
- Animações celebratórias
- Cores vibrantes
- Sons agradáveis (opcional)
- Mensagens encorajadoras

---

## 🔧 Implementação

### Estrutura de Arquivos
```
src/
├── assets/
│   └── logo.svg
├── components/
│   ├── Logo.js
│   └── Logo.css
├── pages/
│   ├── Login.js
│   ├── Login.css
│   ├── PainelAluno.js
│   └── PainelAluno.css
└── index.css (Design System)
```

### Uso do Logo
```jsx
import Logo from '../components/Logo';

// Com texto
<Logo size="medium" showText={true} animated={true} />

// Apenas ícone
<Logo size="large" showText={false} animated={true} />

// Tamanhos: small, medium, large, xlarge
```

### Classes Utilitárias
```jsx
<div className="fade-in">Conteúdo</div>
<div className="fade-in-up">Conteúdo</div>
<div className="slide-in-left">Conteúdo</div>
```

---

## 📚 Referências

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Inclusive Design Principles](https://inclusivedesignprinciples.org/)
- [Neurodiversity Design System](https://neurodiversity.design/)

---

## 🚀 Próximos Passos

1. **Temas**: Modo escuro e temas personalizáveis
2. **Componentes**: Biblioteca expandida (modals, tooltips, etc)
3. **Animações**: Mais microinterações contextuais
4. **Ilustrações**: Personagens e mascotes
5. **Sons**: Feedback sonoro opcional
6. **Internacionalização**: Suporte a múltiplos idiomas

---

**Versão**: 1.0.0  
**Última atualização**: Fevereiro 2026  
**Mantido por**: Equipe NeuroPlay
