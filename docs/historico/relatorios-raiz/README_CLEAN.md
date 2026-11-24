# 🧠 NeuroPlay

> Plataforma gamificada para apoio terapêutico de crianças com Transtorno do Espectro Autista (TEA)

[![CI/CD](https://github.com/seu-usuario/neuroplay/actions/workflows/full-stack-ci.yml/badge.svg)](https://github.com/seu-usuario/neuroplay/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📋 Sobre o Projeto

NeuroPlay é uma plataforma web desenvolvida para auxiliar no desenvolvimento de habilidades cognitivas e sociais de crianças com TEA através de jogos adaptáveis. A plataforma utiliza inteligência artificial para ajustar automaticamente a dificuldade dos jogos com base no desempenho individual de cada criança.

### 🎯 Objetivos

- **Treino de Funções Executivas**: Jogos focados em atenção, memória de trabalho e controle inibitório
- **Adaptação Inteligente**: IA ajusta dificuldade em tempo real
- **Monitoramento de Progresso**: Painel completo para educadores e terapeutas
- **Acessibilidade**: Interface projetada especificamente para crianças com TEA

### 🎮 Jogos Disponíveis

1. **Mestres do Sinal** - Treino de controle inibitório (Go/No-Go Task)
2. **Memória Dupla** - Treino de memória de trabalho (Dual N-Back)
3. **Caçador de Alvos** - Treino de atenção seletiva e coordenação

## 🚀 Tecnologias

### Frontend
- **React 18** - Framework JavaScript
- **React Router** - Navegação
- **Framer Motion** - Animações
- **Three.js / React Three Fiber** - Gráficos 3D
- **Recharts** - Visualizações de dados

### Backend
- **Python 3.11** - Linguagem principal
- **Flask** - Framework web
- **PostgreSQL** - Banco de dados
- **Redis** - Cache e filas
- **Celery** - Processamento assíncrono

### DevOps & CI/CD
- **Docker** - Containerização
- **GitHub Actions** - CI/CD
- **Sentry** - Monitoramento de erros
- **Locust** - Testes de carga

## 📦 Instalação

### Pré-requisitos

- Node.js 20+
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Docker (opcional)

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/neuroplay.git
cd neuroplay

# 2. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# 3. Frontend
cd frontend
npm install
npm start

# 4. Backend (nova janela de terminal)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py

# 5. Banco de dados
psql -U postgres -f database/schema.sql
```

### Docker (Recomendado)

```bash
# Desenvolvimento
docker-compose up

# Produção
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 Testes

```bash
# Frontend
cd frontend
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:coverage      # Coverage report

# Backend
cd backend
pytest                     # Unit tests
pytest --cov              # Coverage report

# Testes integrados
npm run test:all          # Roda todos os testes
```

## 📖 Documentação

- [Guia de Configuração](docs/guides/SETUP.md)
- [Arquitetura](docs/architecture/ARQUITETURA_V2.md)
- [API Documentation](docs/api/README.md)
- [Guia de Contribuição](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Veja [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre:

- Código de conduta
- Processo de pull request
- Padrões de código
- Como reportar bugs

## 📊 Roadmap

- [x] Sistema de autenticação
- [x] 3 jogos principais implementados
- [x] Painel do educador com analytics
- [x] Sistema de adaptação de IA
- [x] Detector de cascata de erros
- [ ] Modo offline completo
- [ ] Exportação de relatórios em PDF
- [ ] Integração com wearables
- [ ] Modo multiplayer cooperativo

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Equipe

- **Desenvolvimento**: [Seu Nome]
- **Orientação**: [Nome do Orientador]
- **Instituição**: [Nome da Instituição]

## 🙏 Agradecimentos

- Famílias e crianças que participaram dos testes
- Profissionais de saúde que forneceram feedback
- Comunidade open source pelas ferramentas utilizadas

## 📧 Contato

- **Email**: contato@neuroplay.app
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/neuroplay/issues)
- **Documentação**: [neuroplay.app/docs](https://neuroplay.app/docs)

---

<p align="center">
  Feito com ❤️ para apoiar o desenvolvimento de crianças com TEA
</p>
