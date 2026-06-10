# 🚀 Comandos para Deploy - NeuroPlay v2.5.0

## 📋 Checklist Rápido

- [ ] Revisou o DEPLOY_REPORT.md?
- [ ] Executou pre-commit-check.ps1?
- [ ] README.md está atualizado?
- [ ] Secrets estão no GitHub?
- [ ] Versão atualizada em package.json?

## 🔍 1. Verificação de Segurança

```bash
# Windows PowerShell
.\scripts\pre-commit-check.ps1

# Se passar, continue. Se falhar, corrija os erros!
```

## 📝 2. Verificar Status do Git

```bash
# Ver arquivos modificados
git status

# Ver diferenças
git diff

# Ver arquivos que serão commitados
git diff --cached
```

## ✅ 3. Adicionar Mudanças ao Stage

```bash
# Adicionar todos os arquivos
git add .

# OU adicionar seletivamente
git add README.md
git add CHANGELOG.md
git add SECURITY.md
git add .gitignore
git add docs/
git add scripts/
```

## 💾 4. Commit com Conventional Commits

```bash
git commit -m "chore: preparar projeto para deploy v2.5.0

- Organizar documentação em estrutura limpa (docs/development/)
- Adicionar CHANGELOG.md com histórico de versões
- Adicionar SECURITY.md com política de segurança
- Atualizar .gitignore com proteções robustas contra secrets
- Criar scripts de pre-commit check e organização
- Documentar estrutura completa do projeto
- Remover arquivos temporários e de progresso da raiz
- Adicionar README_CLEAN.md como template profissional

BREAKING CHANGE: Documentação reorganizada. Arquivos movidos:
- Progresso -> docs/development/progress/
- Planejamento -> docs/development/planning/
- Commits -> docs/development/commits/
- Testes -> docs/development/testing/
- Análises -> docs/development/analysis/

Co-authored-by: Kiro AI <kiro@example.com>"
```

## 🚀 5. Push para GitHub

```bash
# Push para branch principal
git push origin main

# Se for primeira vez ou branch nova:
git push -u origin main
```

## 🏷️ 6. Criar Tag de Versão

```bash
# Criar tag anotada
git tag -a v2.5.0 -m "Release v2.5.0: Detector de Cascata + Organização Completa"

# Listar tags para confirmar
git tag

# Push da tag
git push origin v2.5.0

# OU push de todas as tags
git push origin --tags
```

## 📦 7. Criar GitHub Release

### Opção A: Via Interface Web
1. Ir para: https://github.com/seu-usuario/neuroplay/releases/new
2. Preencher:
   - **Tag version**: v2.5.0
   - **Release title**: v2.5.0 - Detector de Cascata + Organização de Projeto
   - **Description**: Copiar de CHANGELOG.md seção [2.5.0]
3. Clicar em "Publish release"

### Opção B: Via GitHub CLI (se instalado)
```bash
gh release create v2.5.0 \
  --title "v2.5.0 - Detector de Cascata + Organização de Projeto" \
  --notes-file CHANGELOG.md
```

## 🔐 8. Configurar GitHub Secrets

```bash
# Via GitHub CLI
gh secret set SECRET_KEY --body "sua-chave-secreta"
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set REDIS_URL --body "redis://..."
gh secret set SENTRY_DSN --body "https://..."

# OU via Interface Web:
# https://github.com/seu-usuario/neuroplay/settings/secrets/actions
```

### Secrets Necessários

**Backend:**
```
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=postgresql://user:pass@host:5432/neuroplay
REDIS_URL=redis://host:6379/0
CELERY_BROKER_URL=redis://host:6379/0
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ORG=your-org
SENTRY_AUTH_TOKEN=your-token
```

**Frontend:**
```
REACT_APP_API_URL=https://api.neuroplay.app
REACT_APP_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
REACT_APP_ENVIRONMENT=production
```

**Deploy:**
```
RAILWAY_TOKEN=xxxxx
# OU
RENDER_API_KEY=xxxxx
# OU
VERCEL_TOKEN=xxxxx
```

## 🧪 9. Monitorar CI/CD

```bash
# Ver status dos workflows
gh run list

# Ver detalhes de um workflow
gh run view [run-id]

# Ver logs
gh run view [run-id] --log
```

### OU via Interface Web:
- https://github.com/seu-usuario/neuroplay/actions

## 📊 10. Verificar Deploy

### Frontend (Vercel/Netlify)
```bash
curl -I https://neuroplay.app
# Deve retornar 200 OK
```

### Backend (Railway/Render)
```bash
curl https://api.neuroplay.app/health
# Deve retornar {"status": "ok"}
```

### Sentry
- Verificar: https://sentry.io/organizations/your-org/issues/
- Confirmar que não há erros críticos

## 🔄 11. Rollback (Se Necessário)

### Opção A: Reverter Commit
```bash
git revert HEAD
git push origin main
```

### Opção B: Reset para Commit Anterior
```bash
# ⚠️ CUIDADO: Perigoso se já houver push
git reset --hard HEAD~1
git push origin main --force
```

### Opção C: Via Plataforma de Deploy
- **Railway**: Dashboard → Deployments → Rollback
- **Render**: Dashboard → Rollback to previous deploy
- **Vercel**: Dashboard → Deployments → Promote

## 📝 12. Atualizar Documentação Pós-Deploy

```bash
# Atualizar README se necessário
# Adicionar notas de release
# Atualizar CHANGELOG com data real de deploy

git add README.md CHANGELOG.md
git commit -m "docs: atualizar pós-deploy v2.5.0"
git push origin main
```

## 🎉 13. Comunicar Release

### Para Equipe
```markdown
🚀 **NeuroPlay v2.5.0 Deploy**

Principais mudanças:
- ✨ Detector de Cascata de Erros
- 📚 Documentação reorganizada
- 🔒 Melhorias de segurança
- 🎨 Sistema de design unificado

Links:
- Deploy: https://neuroplay.app
- Release: https://github.com/user/neuroplay/releases/tag/v2.5.0
- Changelog: https://github.com/user/neuroplay/blob/main/CHANGELOG.md
```

### Para Usuários
```markdown
📢 **Nova Versão Disponível!**

O NeuroPlay v2.5.0 está no ar com melhorias de experiência e novos recursos de segurança.

Detalhes: https://neuroplay.app/changelog
```

## 🐛 14. Troubleshooting

### CI/CD Falhando
```bash
# Ver logs detalhados
gh run view --log-failed

# Executar testes localmente
npm test          # Frontend
pytest            # Backend
```

### Deploy Falhando
```bash
# Verificar variáveis de ambiente
heroku config      # Heroku
railway variables  # Railway

# Ver logs
heroku logs --tail
railway logs
```

### Build Falhando
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## 📚 Recursos Úteis

- [DEPLOY_REPORT.md](DEPLOY_REPORT.md) - Relatório completo
- [CHANGELOG.md](CHANGELOG.md) - Histórico de mudanças
- [SECURITY.md](SECURITY.md) - Política de segurança
- [CONTRIBUTING.md](CONTRIBUTING.md) - Como contribuir
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Estrutura

---

## ✅ Checklist Final Pós-Deploy

- [ ] CI/CD passou (todos os workflows verdes)
- [ ] Frontend acessível
- [ ] Backend respondendo
- [ ] Sentry sem erros críticos
- [ ] Tag criada no Git
- [ ] GitHub Release publicado
- [ ] Equipe notificada
- [ ] Monitoramento ativo

---

**Boa sorte com o deploy! 🚀**

Se algo der errado, não entre em pânico:
1. Verifique os logs
2. Consulte DEPLOY_REPORT.md
3. Faça rollback se necessário
4. Abra uma issue no GitHub

**Data:** 13/02/2026  
**Versão:** 2.5.0
