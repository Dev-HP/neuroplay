# 🧠 NeuroPlay - Plataforma Adaptativa para Inclusão Digital

[![Deploy Frontend](https://github.com/[user]/[repo]/workflows/Deploy%20Frontend/badge.svg)](https://github.com/[user]/[repo]/actions)
[![Backend CI](https://github.com/[user]/[repo]/workflows/Backend%20CI/badge.svg)](https://github.com/[user]/[repo]/actions)
[![Docker Build](https://github.com/[user]/[repo]/workflows/Docker%20Build/badge.svg)](https://github.com/[user]/[repo]/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Plataforma web gamificada de **primeira linha** com jogos terapêuticos baseados em evidências científicas para crianças com TEA e TDAH.

## 🌟 Destaques

- 🎮 **8 Jogos Terapêuticos** baseados em pesquisas FDA-approved
- 🤖 **IA Adaptativa** com TensorFlow.js e Scikit-learn
- 🎨 **Renderização 3D** com Three.js
- 🔊 **Áudio Procedural** com Web Audio API e Tone.js
- 📊 **Analytics Avançado** com insights personalizados
- 🚀 **CI/CD Completo** com GitHub Actions
- 🐳 **Docker Ready** para deploy rápido

## 🎯 Jogos Implementados

### ✅ Disponíveis
1. **Mestres do Sinal** - Controle inibitório (Go/No-Go)
2. **Caçador de Alvos** - Jogo 3D espacial (inspirado em EndeavorRx FDA-approved)
3. **Memória Dupla** - Dual N-Back para memória de trabalho

### 🔨 Em Desenvolvimento
4. Cores em Conflito (Stroop Task)
5. Foco no Alvo (Flanker Task)
6. Quebra-cabeça Adaptativo
7. Jogo da Memória Plus
8. Ritmo e Sequência

## 🚀 Stack Tecnológico

### Frontend
- **React 18** + **Three.js** + **Framer Motion**
- **TensorFlow.js** + **Tone.js** + **Howler.js**
- **Zustand** + **Axios** + **Recharts**

### Backend
- **Flask 3.0** + **SocketIO** + **SQLAlchemy**
- **Scikit-learn** + **NumPy** + **Pandas**
- **PostgreSQL** + **Redis**

### DevOps
- **Docker** + **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Nginx** (Reverse Proxy)

## 📦 Instalação

### Opção 1: Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/[user]/neuroplay.git
cd neuroplay

# Inicie todos os serviços
docker-compose up -d

# Acesse:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# PgAdmin: http://localhost:5050
```

### Opção 2: Manual

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (em outro terminal)
cd frontend
npm install
npm start
```

## 🌐 Deploy

### GitHub Pages (Automático)

1. Faça push para `main`:
```bash
git add .
git commit -m "Deploy"
git push origin main
```

2. Acesse: `https://[seu-usuario].github.io/[repo]`

### Outras Plataformas

- **Vercel**: `vercel --prod`
- **Heroku**: `git push heroku main`
- **Railway**: Conecte o repositório
- **AWS**: Veja `docs/DEPLOY.md`

## 📚 Documentação

- [📖 Arquitetura](docs/ARQUITETURA.md)
- [🎮 Jogos Terapêuticos](docs/JOGOS_TERAPEUTICOS.md)
- [💻 Tecnologias](docs/TECNOLOGIAS.md)
- [🚀 Deploy](docs/DEPLOY.md)
- [⚙️ Instalação](docs/INSTALACAO.md)

## 🎨 Screenshots

```
[Adicionar screenshots aqui]
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja nosso [guia de contribuição](CONTRIBUTING.md).

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Hélio Paulo Leite de Lima** - RU: 4505463

## 🙏 Agradecimentos

- Pesquisas baseadas em EndeavorRx (FDA-approved)
- Dual N-Back Training (Jaeggi et al.)
- Stroop & Flanker Tasks (Neuropsychology)
- UNINTER - Centro Universitário Internacional

## 📞 Contato

- Email: [seu-email]
- LinkedIn: [seu-linkedin]
- GitHub: [seu-github]

---

**NeuroPlay** - Tecnologia de ponta para inclusão digital! 🚀🧠✨
