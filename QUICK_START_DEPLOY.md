# ⚡ Quick Start - Deploy em 5 Minutos

> Guia rápido para fazer deploy do NeuroPlay v2.5.0 no GitHub

## 🚀 Deploy Rápido (Copy & Paste)

### 1️⃣ Verificar Segurança (30 segundos)
```bash
# Rodar verificação de segurança
./scripts/pre-commit-check.ps1

# ✅ Se passar, continue
# ❌ Se falhar, corrija os erros indicados
```

### 2️⃣ Revisar Mudanças (1 minuto)
```bash
# Ver o que mudou
git status

# Ver arquivos específicos (opcional)
git diff README.md
git diff .gitignore
```

### 3️⃣ Commitar Tudo (30 segundos)
```bash
git add .
git commit -m "chore: preparar projeto para deploy v2.5.0

- Organizar documentação em docs/development/
- Adicionar CHANGELOG.md, SECURITY.md
- Atualizar .gitignore com proteções robustas
- Criar scripts de verificação e deploy
- Remover arquivos temporários

BREAKING CHANGE: Documentação reorganizada"
```

### 4️⃣ Push para GitHub (30 segundos)
```bash
# Push das mudanças
git push origin main

# Criar e push da tag
git tag -a v2.5.0 -m "Release v2.5.0"
git push origin v2.5.0
```

### 5️⃣ Criar Release no GitHub (2 minutos)
1. Ir para: https://github.com/seu-usuario/neuroplay/releases/new
2. Tag: `v2.5.0`
3. Título: `v2.5.0 - Detector de Cascata + Organização`
4. Copiar notas de `CHANGELOG.md`
5. Clicar em **Publish release**

---

## 🎯 Pronto! Deploy Completo

✅ Código no GitHub  
✅ Tag de versão criada  
✅ Release publicado  
✅ CI/CD executando automaticamente  

---

## 📊 Monitorar

### GitHub Actions
https://github.com/seu-usuario/neuroplay/actions

### Sentry
https://sentry.io/organizations/your-org/issues/

### Seu Site
https://neuroplay.app

---

## 🆘 Problemas?

### CI/CD Falhando
```bash
gh run view --log-failed
```

### Rollback Rápido
```bash
git revert HEAD
git push origin main
```

### Documentação Completa
- [DEPLOY_REPORT.md](DEPLOY_REPORT.md) - Relatório completo
- [DEPLOY_COMMANDS.md](DEPLOY_COMMANDS.md) - Todos os comandos
- [SECURITY.md](SECURITY.md) - Segurança

---

**Tempo total: ~5 minutos** ⚡

**Boa sorte! 🚀**
