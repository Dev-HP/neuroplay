# 🎮 Como Testar o Cyber-Runner (Tkinter)

## ✅ SEM INSTALAÇÃO NECESSÁRIA!

O jogo usa Tkinter que já vem com Python. Não precisa instalar nada!

## 1️⃣ Testar o Jogo Diretamente

```powershell
python games_pygame/cyber_runner_tkinter.py
```

### Controles:
- **ESPAÇO**: Pular (obstáculos verdes)
- **↓ (Seta Baixo)**: Deslizar (obstáculos vermelhos)
- **Mouse**: Clicar nas respostas matemáticas

## 2️⃣ Testar via Backend (Integrado)

### Iniciar Backend:
```powershell
cd backend
python app.py
```

### Iniciar Frontend:
```powershell
cd frontend
npm start
```

### Acessar:
1. Abra http://localhost:3000
2. Faça login
3. Clique no card "Cyber-Runner" (com badge 🐍 Pygame)
4. O jogo abrirá em uma janela separada

## 3️⃣ Verificar Telemetria

Após jogar, verifique o arquivo gerado:
```
telemetria_YYYYMMDD_HHMMSS.json
```

## 📊 Dados Salvos

O jogo salva:
- Pontuação final
- Acertos e erros
- Precisão (%)
- Session ID

## 🎯 Próximos Passos

1. ✅ Cyber-Runner funcionando (Tkinter)
2. ⏳ Echo Temple (Memória Visuoespacial)
3. ⏳ Sonic Jump (Processamento Fonológico)
4. ⏳ Gravity Lab (Lógica e Flexibilidade)
