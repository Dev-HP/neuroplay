# 🚀 Quick Start - NeuroPlay

## ⚡ Execução Rápida (Recomendado)

### 1. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `neuroplay`
3. Clique em "Create repository"
4. **Copie a URL do repositório**

### 2. Configurar Git

```powershell
# Substitua SEU_USUARIO pelo seu usuário do GitHub
git remote set-url origin https://github.com/SEU_USUARIO/neuroplay.git

# Fazer push
git push -u origin main
```

### 3. Habilitar GitHub Pages

1. Vá em: `Settings > Pages`
2. Source: **GitHub Actions**
3. Aguarde o deploy (5-10 minutos)
4. Acesse: `https://SEU_USUARIO.github.io/neuroplay`

---

## 💻 Executar Localmente

### Opção A: Apenas Frontend (Mais Rápido)

```powershell
# 1. Ir para pasta frontend
cd frontend

# 2. Instalar dependências (pode demorar)
npm install --legacy-peer-deps

# 3. Iniciar servidor
npm start

# 4. Abrir navegador em: http://localhost:3000
```

### Opção B: Frontend + Backend

**Terminal 1 (Backend):**
```powershell
cd backend
pip install -r requirements.txt
python app.py
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm install --legacy-peer-deps
npm start
```

---

## 🐛 Problemas Comuns

### Erro: "npm install falha"

**Solução:**
```powershell
# Limpar cache
npm cache clean --force

# Tentar novamente
npm install --legacy-peer-deps --force
```

### Erro: "Docker não encontrado"

**Solução:**
- Instale Docker Desktop: https://www.docker.com/products/docker-desktop
- OU execute localmente (Opção A acima)

### Erro: "Python não encontrado"

**Solução:**
- Instale Python 3.11: https://www.python.org/downloads/
- Marque "Add Python to PATH" durante instalação

### Erro: "PostgreSQL não conecta"

**Solução:**
- Instale PostgreSQL: https://www.postgresql.org/download/
- OU use SQLite (mais simples para desenvolvimento)

---

## 📱 Acessar o Site

### GitHub Pages (Após deploy)
```
https://SEU_USUARIO.github.io/neuroplay
```

### Local
```
http://localhost:3000
```

---

## 🎮 Testar os Jogos

1. **Criar conta** como Aluno ou Educador
2. **Fazer login**
3. **Selecionar jogo:**
   - 🚫 Mestres do Sinal
   - 🚀 Caçador de Alvos (3D)
   - 🧠 Memória Dupla (N-Back)

---

## 📊 Ver Relatórios (Educador)

1. Login como Educador
2. Painel mostra:
   - Lista de alunos
   - Gráficos de desempenho
   - Métricas detalhadas

---

## 🔧 Comandos Úteis

```powershell
# Ver status do Git
git status

# Ver logs do npm
npm run build

# Verificar versões
node --version
npm --version
python --version

# Limpar tudo e recomeçar
rm -rf node_modules
npm install --legacy-peer-deps
```

---

## 💡 Dicas

1. **Use Chrome ou Edge** para melhor compatibilidade
2. **Habilite JavaScript** no navegador
3. **Aguarde o build** completar (pode demorar 5-10 min)
4. **Verifique o console** (F12) se houver erros

---

## 📞 Precisa de Ajuda?

- Abra uma issue no GitHub
- Verifique a documentação em `docs/`
- Consulte `docs/DEPLOY.md` para deploy avançado

---

**NeuroPlay** - Pronto para usar! 🚀🧠✨
