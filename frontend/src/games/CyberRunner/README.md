# 🎮 Cyber-Runner - Módulo de Controle Inibitório

## Visão Geral

O **Cyber-Runner** é o primeiro módulo do NeuroPlay 2.0, um jogo endless runner 2.5D projetado para treinar funções executivas em crianças com TEA.

## 🧠 Objetivos Terapêuticos

### Funções Cognitivas Treinadas

1. **Controle Inibitório Motor**
   - Tarefa Go/No-Go
   - Resposta rápida vs. inibição de resposta
   - Melhora a capacidade de controlar impulsos

2. **Memória de Trabalho**
   - Dual-task (movimento + matemática)
   - Manutenção de informação durante ação
   - Atualização constante de objetivos

3. **Raciocínio Aritmético**
   - Resolução de equações sob pressão
   - Integração de múltiplas habilidades
   - Transferência cognitiva

## 🎯 Mecânicas de Jogo

### Controles

| Ação | Tecla | Objetivo |
|------|-------|----------|
| Pular | `ESPAÇO` ou `↑` | Obstáculos VERDES (Go) |
| Deslizar | `↓` | Obstáculos VERMELHOS (No-Go) |
| Responder | `Clique` | Equações matemáticas |

### Sistema de Pontuação

- **Acerto Go/No-Go**: +10 pontos
- **Acerto Matemática**: +50 pontos
- **Erro**: -1 vida (total: 3 vidas)

### Níveis de Dificuldade

#### Easy
- Intervalo entre obstáculos: 3.0s
- Proporção Go/No-Go: 70%/30%
- Velocidade: 1.0x
- Operações: + e -

#### Medium
- Intervalo: 2.0s
- Proporção: 60%/40%
- Velocidade: 1.3x
- Operações: +, -, ×

#### Hard
- Intervalo: 1.5s
- Proporção: 50%/50%
- Velocidade: 1.8x
- Operações: +, -, ×, ÷

## 📊 Telemetria Coletada

### Eventos Registrados

```javascript
{
  event_type: 'go_nogo_response',
  obstacle_type: 'go' | 'nogo',
  player_action: 'jump' | 'slide' | 'none',
  reaction_time_ms: 450,
  was_correct: true,
  current_speed: 1.3,
  current_score: 120
}
```

```javascript
{
  event_type: 'math_solve',
  equation: '4 + 2 = ?',
  was_correct: true,
  reaction_time_ms: 3200,
  current_score: 170
}
```

### Métricas Calculadas

- **Precisão**: % de respostas corretas
- **Tempo de Reação Médio**: Média em ms
- **Taxa de Erro**: % de respostas incorretas
- **Tendência de Melhoria**: Comparação entre sessões

## 🏗️ Arquitetura Técnica

### Stack

- **React Three Fiber**: Renderização 3D
- **Rapier**: Física WebAssembly
- **Tone.js**: Síntese de áudio
- **GSAP**: Animações
- **Zustand**: State management

### Componentes Principais

```
CyberRunner/
├── CyberRunner.js           # Orquestrador principal
├── components/
│   ├── PlayerCharacter.js   # Física e controle do jogador
│   ├── RunnerTrack.js       # Pista infinita com grid
│   ├── Obstacle.js          # Obstáculo individual (Go/No-Go)
│   ├── ObstacleGenerator.js # Geração procedural
│   ├── MathPortalSystem.js  # Sistema de equações
│   └── GameUI.js            # HUD e overlays
└── hooks/
    └── useKeyboardControls.js # Input handling
```

### Fluxo de Dados

```
User Input → PlayerCharacter → Collision Detection
                                      ↓
                              Telemetry Hook
                                      ↓
                              Backend API
                                      ↓
                              Database
```

## 🎨 Design Visual

### Paleta de Cores

- **Fundo**: `#0a0e27` → `#1a1f3a` (gradiente)
- **Obstáculo Go**: `#00ff00` (verde neon)
- **Obstáculo No-Go**: `#ff0000` (vermelho neon)
- **UI**: `#00ffff` (ciano)
- **Acertos**: `#ffff00` (amarelo)

### Efeitos Visuais

- **Bloom**: Brilho neon nos obstáculos
- **Partículas**: Explosões em acertos/erros
- **Grid**: Efeito cyberpunk na pista
- **Pulse**: Animação de escala nos obstáculos

## ♿ Acessibilidade

### Implementado

- ✅ Alto contraste (WCAG AAA)
- ✅ Legendas para todos os áudios
- ✅ Suporte a teclado completo
- ✅ Feedback multissensorial
- ✅ `prefers-reduced-motion` respeitado
- ✅ ARIA labels em botões

### Planejado

- [ ] Suporte a leitores de tela
- [ ] Modo daltônico
- [ ] Ajuste de velocidade
- [ ] Modo sem som

## 📈 Evidências Científicas

### Fundamentação

1. **Go/No-Go Task**
   - Melhora controle inibitório (g=0.45)
   - Reduz impulsividade
   - Transfere para comportamento diário

2. **Dual-Task Training**
   - Aumenta capacidade de memória de trabalho
   - Melhora flexibilidade cognitiva
   - Fortalece atenção dividida

3. **Gamificação**
   - Aumenta engajamento em 78%
   - Reduz ansiedade em contexto terapêutico
   - Melhora adesão ao tratamento

### Referências

- Frontiers in Pediatrics (2025) - Meta-análise GBI
- PMC 9029765 (2022) - Funções executivas e jogos
- Frontiers Psychology (2021) - Jogos para TEA

## 🧪 Testes Realizados

### Testes Unitários

- [ ] PlayerCharacter collision detection
- [ ] ObstacleGenerator spawn timing
- [ ] MathPortalSystem equation generation
- [ ] Telemetry event logging

### Testes de Integração

- [ ] Fluxo completo de jogo
- [ ] Persistência de telemetria
- [ ] Cálculo de métricas
- [ ] Adaptação de dificuldade

### Testes com Usuários

- [ ] 5 crianças TEA (6-12 anos)
- [ ] 3 terapeutas ocupacionais
- [ ] 2 educadores especiais

## 🚀 Roadmap

### v1.1 (Próxima Release)
- [ ] Mais tipos de obstáculos
- [ ] Power-ups (escudo, slow-motion)
- [ ] Sistema de conquistas
- [ ] Música de fundo adaptativa

### v1.2
- [ ] Modo multiplayer cooperativo
- [ ] Customização de avatar
- [ ] Integração com NeuroGuardian Hub
- [ ] Relatórios para terapeutas

### v2.0
- [ ] VR support
- [ ] Biofeedback (frequência cardíaca)
- [ ] IA adaptativa avançada
- [ ] Modo narrativo

## 🤝 Contribuindo

Para contribuir com melhorias:

1. Leia `CONTRIBUTING.md`
2. Crie uma branch: `git checkout -b feature/melhoria`
3. Commit: `git commit -m 'Adiciona melhoria X'`
4. Push: `git push origin feature/melhoria`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja `LICENSE` para mais detalhes.

---

**Desenvolvido com ❤️ para crianças com TEA**  
**NeuroPlay 2.0 - Transformando terapia em diversão**
