# ⚡ Quick Start - Cyber-Runner

## 🚀 Instalação em 3 Passos

### 1. Instalar Dependências

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install flask flask-cors flask-sqlalchemy
```

### 2. Iniciar Servidores

```bash
# Terminal 1: Backend
cd backend && python app.py

# Terminal 2: Frontend  
cd frontend && npm start
```

### 3. Jogar

Acesse: `http://localhost:3000/jogo/cyber-runner`

---

## 🎮 Controles

| Tecla | Ação |
|-------|------|
| `ESPAÇO` ou `↑` | Pular (obstáculos verdes) |
| `↓` | Deslizar (obstáculos vermelhos) |
| `Clique` | Responder matemática |

---

## 📊 Testar Telemetria

### Ver Sessão
```bash
curl http://localhost:5000/api/telemetry/session/<SESSION_ID>
```

### Ver Progresso
```bash
curl http://localhost:5000/api/telemetry/progress/1/cyber_runner
```

---

## 🐛 Problemas Comuns

### Erro: "Cannot find module"
```bash
cd frontend && npm install
```

### Jogo lento
Comente o Bloom em `CyberRunner.js`:
```javascript
// <EffectComposer>
//   <Bloom ... />
// </EffectComposer>
```

### CORS Error
Verifique se backend está rodando na porta 5000

---

## 📚 Documentação Completa

- `CYBER_RUNNER_MVP.md` - Guia detalhado
- `IMPLEMENTACAO_COMPLETA.md` - Resumo do projeto
- `frontend/src/games/CyberRunner/README.md` - Docs técnicas

---

**Pronto para jogar!** 🎮
