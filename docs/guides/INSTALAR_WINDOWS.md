# 🪟 Instalação no Windows - Cyber-Runner

## ⚡ Comandos para PowerShell

### 1️⃣ Instalar Dependências do Frontend

```powershell
cd frontend
npm install
cd ..
```

### 2️⃣ Instalar Dependências do Backend

```powershell
cd backend
pip install flask flask-cors flask-sqlalchemy
cd ..
```

### 3️⃣ Iniciar o Sistema

#### Opção A: Dois Terminais Separados

**Terminal 1 - Backend:**
```powershell
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

#### Opção B: Script PowerShell Automático

Crie um arquivo `start.ps1`:

```powershell
# start.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"
```

Execute:
```powershell
.\start.ps1
```

### 4️⃣ Acessar o Jogo

Abra o navegador em: `http://localhost:3000/jogo/cyber-runner`

---

## 🔧 Comandos Passo a Passo

### Passo 1: Navegar para a pasta do projeto
```powershell
cd "C:\APLICATIVO DE TEA"
```

### Passo 2: Instalar frontend
```powershell
cd frontend
npm install
```

Aguarde a instalação terminar (pode demorar alguns minutos).

### Passo 3: Voltar e instalar backend
```powershell
cd ..
cd backend
pip install flask flask-cors flask-sqlalchemy
```

### Passo 4: Iniciar backend
```powershell
python app.py
```

Você verá:
```
 * Running on http://127.0.0.1:5000
✅ Banco de telemetria inicializado
```

### Passo 5: Abrir NOVO terminal PowerShell

Pressione `Windows + X` → Escolha "Windows PowerShell"

### Passo 6: No novo terminal, iniciar frontend
```powershell
cd "C:\APLICATIVO DE TEA"
cd frontend
npm start
```

O navegador abrirá automaticamente em `http://localhost:3000`

---

## 🎮 Testar o Jogo

1. Faça login no sistema
2. Na barra de endereço, digite: `http://localhost:3000/jogo/cyber-runner`
3. Clique em "INICIAR JOGO"
4. Use as teclas:
   - `ESPAÇO` = Pular (obstáculos verdes)
   - `↓` = Deslizar (obstáculos vermelhos)

---

## 🐛 Problemas Comuns

### Erro: "npm não é reconhecido"

Instale o Node.js: https://nodejs.org/

### Erro: "python não é reconhecido"

Instale o Python: https://www.python.org/downloads/

Marque a opção "Add Python to PATH" durante instalação.

### Erro: "Porta 3000 já está em uso"

```powershell
# Matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <número_do_pid> /F
```

### Erro: "Porta 5000 já está em uso"

```powershell
# Matar processo na porta 5000
netstat -ano | findstr :5000
taskkill /PID <número_do_pid> /F
```

---

## 📝 Script de Instalação Completo

Copie e cole no PowerShell (linha por linha):

```powershell
# Navegar para o projeto
cd "C:\APLICATIVO DE TEA"

# Instalar frontend
Write-Host "Instalando dependências do frontend..." -ForegroundColor Cyan
cd frontend
npm install
cd ..

# Instalar backend
Write-Host "Instalando dependências do backend..." -ForegroundColor Cyan
cd backend
pip install flask flask-cors flask-sqlalchemy
cd ..

Write-Host "✅ Instalação concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o sistema:" -ForegroundColor Yellow
Write-Host "1. Terminal 1: cd backend; python app.py" -ForegroundColor White
Write-Host "2. Terminal 2: cd frontend; npm start" -ForegroundColor White
```

---

## 🚀 Atalho Rápido

Crie um arquivo `INICIAR.bat` na raiz do projeto:

```batch
@echo off
echo Iniciando NeuroPlay 2.0...
start "Backend" cmd /k "cd backend && python app.py"
timeout /t 3
start "Frontend" cmd /k "cd frontend && npm start"
echo Sistema iniciado!
```

Depois, apenas clique duas vezes em `INICIAR.bat`

---

## ✅ Verificar Instalação

```powershell
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Python
python --version

# Verificar pip
pip --version
```

Todos devem retornar versões válidas.

---

**Pronto para começar!** 🎮
