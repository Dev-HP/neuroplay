# Guia de Deploy - NeuroPlay

## 🚀 Deploy com GitHub Actions

### Configuração Inicial

1. **Habilitar GitHub Pages:**
   - Vá em Settings > Pages
   - Source: GitHub Actions
   - Branch: main

2. **Configurar Secrets (opcional):**
   ```
   Settings > Secrets and variables > Actions > New repository secret
   
   - API_URL: URL da sua API backend
   - SNYK_TOKEN: Token do Snyk (segurança)
   ```

3. **Push para o repositório:**
   ```bash
   git add .
   git commit -m "Setup CI/CD"
   git push origin main
   ```

4. **Acessar o site:**
   - Após o deploy, acesse: `https://[seu-usuario].github.io/[nome-repo]`

---

## 🐳 Deploy com Docker

### Desenvolvimento Local

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build
```

### Acessar Serviços

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **PgAdmin**: http://localhost:5050
  - Email: admin@neuroplay.com
  - Senha: admin

---

## ☁️ Deploy em Cloud

### Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create neuroplay-app

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Adicionar Redis
heroku addons:create heroku-redis:hobby-dev

# Deploy
git push heroku main

# Abrir app
heroku open
```

### Vercel (Frontend)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Deploy para produção
vercel --prod
```

### Railway (Full Stack)

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático a cada push

### AWS (Produção)

**Frontend (S3 + CloudFront):**
```bash
# Build
cd frontend
npm run build

# Upload para S3
aws s3 sync build/ s3://neuroplay-frontend

# Invalidar cache CloudFront
aws cloudfront create-invalidation --distribution-id XXX --paths "/*"
```

**Backend (EC2 ou ECS):**
```bash
# Usar Docker image
docker build -t neuroplay-backend ./backend
docker tag neuroplay-backend:latest [ECR-URL]
docker push [ECR-URL]
```

---

## 🔧 Workflows Disponíveis

### 1. Deploy Frontend (`deploy-frontend.yml`)
- **Trigger**: Push para main/master
- **Ações**:
  - Build do React
  - Deploy para GitHub Pages
  - Testes automatizados

### 2. Backend CI (`backend-ci.yml`)
- **Trigger**: Push e Pull Requests
- **Ações**:
  - Testes com PostgreSQL e Redis
  - Lint com flake8
  - Coverage report

### 3. Full Stack CI (`full-stack-ci.yml`)
- **Trigger**: Push e Pull Requests
- **Ações**:
  - Análise de código (CodeQL)
  - Security scan (Snyk)
  - Build completo

### 4. Docker Build (`docker-build.yml`)
- **Trigger**: Push para main e tags
- **Ações**:
  - Build de imagens Docker
  - Push para GitHub Container Registry

---

## 📊 Monitoramento

### GitHub Actions Status

Adicione badges ao README:

```markdown
![Deploy Status](https://github.com/[user]/[repo]/workflows/Deploy%20Frontend/badge.svg)
![Backend CI](https://github.com/[user]/[repo]/workflows/Backend%20CI/badge.svg)
```

### Logs

```bash
# Ver logs do workflow
gh run list
gh run view [run-id]

# Ver logs do Docker
docker-compose logs -f [service-name]
```

---

## 🔐 Variáveis de Ambiente

### Frontend (.env)
```env
REACT_APP_API_URL=https://api.neuroplay.com
REACT_APP_ENV=production
```

### Backend (.env)
```env
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=https://neuroplay.com
```

---

## 🚨 Troubleshooting

### Build falha no GitHub Actions

```bash
# Verificar logs
gh run view --log

# Testar localmente
cd frontend
npm ci
npm run build
```

### Docker não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Rebuild sem cache
docker-compose build --no-cache

# Verificar portas
netstat -an | grep 5000
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps

# Testar conexão
docker-compose exec db psql -U postgres -d neuroplay

# Recriar banco
docker-compose down -v
docker-compose up -d
```

---

## 📈 Performance

### Otimizações Frontend

```bash
# Analisar bundle size
cd frontend
npm run build
npx source-map-explorer 'build/static/js/*.js'

# Comprimir assets
npm install --save-dev compression-webpack-plugin
```

### Otimizações Backend

```python
# Usar Gunicorn com workers
gunicorn --workers 4 --threads 2 app:app

# Configurar cache Redis
# Implementar rate limiting
# Usar connection pooling
```

---

## 🔄 Rollback

### GitHub Pages

```bash
# Reverter commit
git revert HEAD
git push origin main

# Ou fazer deploy de versão anterior
git checkout [commit-hash]
git push origin main --force
```

### Docker

```bash
# Usar tag anterior
docker-compose down
docker-compose pull
docker-compose up -d
```

---

## 📝 Checklist de Deploy

- [ ] Testes passando localmente
- [ ] Build sem erros
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets configurados no GitHub
- [ ] Database migrations aplicadas
- [ ] Backup do banco de dados
- [ ] Monitoramento configurado
- [ ] SSL/HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Logs configurados
- [ ] Health checks funcionando

---

## 🎯 Próximos Passos

1. **Configurar CDN** para assets estáticos
2. **Implementar CI/CD** para staging
3. **Configurar alertas** (Sentry, DataDog)
4. **Automatizar backups** do banco
5. **Implementar blue-green deployment**
6. **Configurar auto-scaling**

---

**NeuroPlay** - Deploy automatizado e escalável! 🚀
