# Estrutura do projeto

```text
neuroplay/
├── backend/
│   ├── app.py               API Flask v1: modelos, autenticação, organizações, consentimento, gameplay, auditoria
│   ├── wsgi.py              Entrada do gunicorn (wsgi:application)
│   ├── entrypoint.sh        Cria as tabelas e o catálogo na subida do container
│   ├── tests/               pytest (contratos da API, isolamento entre organizações, saúde)
│   ├── requirements.txt     Dependências de produção
│   ├── requirements-test.txt  + pytest, pytest-cov, flake8
│   └── Dockerfile
├── frontend/
│   ├── index.html           Página de entrada do Vite
│   ├── vite.config.js       Build, CSP, variáveis REACT_APP_* e testes (Vitest)
│   ├── eslint.config.js
│   ├── public/              favicon e service worker
│   ├── nginx.conf, Dockerfile
│   └── src/
│       ├── index.js, App.js       Entrada e rotas
│       ├── registerServiceWorker.js
│       ├── pages/                 Login, PainelAluno, PainelEducador
│       ├── games/
│       │   ├── MestresDoSinal/    Go/No-Go
│       │   ├── CacadorDeAlvos/    Busca visual (Three.js)
│       │   ├── MemoriaDupla/      n-back visual e auditivo
│       │   ├── CyberRunner/       Corrida com escolha rápida (canvas)
│       │   ├── EchoTemple/        Sequência visuoespacial (canvas)
│       │   ├── SonicJump/         Fonemas e tempo (canvas)
│       │   └── GravityLab/        Troca de regra (canvas)
│       ├── features/achievements/ Conquistas desbloqueadas pelos jogos em canvas
│       ├── shared/
│       │   ├── adaptation/        Dificuldade adaptativa dos jogos em canvas
│       │   ├── api/               Envio de partidas para a API
│       │   ├── components/        Logo, GameControls, EmergencyStop, SensorySettings, ParticleSystem
│       │   ├── config/api.js      URL da API e modo demonstração
│       │   ├── demo/              API simulada do modo demonstração
│       │   ├── report/            Indicadores do relatório do educador
│       │   ├── theme/             Tema único dos jogos (cores, fonte, placar, palco)
│       │   └── utils/             Áudio, política de adaptação, detector de erros em cascata
│       └── store/                 Zustand (pontos)
├── docs/                    Índice em docs/README.md
├── .github/workflows/       ci.yml e deploy-frontend.yml
├── docker-compose.yml       Stack local (frontend, API, PostgreSQL; PgAdmin opcional)
└── docker-compose.prod.yml  Produção em um host
```

## Convenções

- **Um jogo por pasta** em `frontend/src/games/<Nome>/`, com `.js` e `.css` próprios.
- **CSS escopado:** toda regra de um componente começa pela classe raiz dele (por exemplo, `.jogo-container .btn-large`). O build junta o CSS de todas as telas; sem o escopo, classes como `.btn-primary` vazam entre elas.
- **Jogos em canvas:** o estado do jogo vive em `gameRef` e é criado uma única vez. Valores que o laço de desenho precisa ler atualizados (mensagem adaptativa, `trackEvent`) ficam em refs.
- **Salvamento:** a partida termina por fim natural ou pelo botão "Encerrar" e só é gravada se houve jogada.
- **Dados:** nada identificável em fixtures; perfis de estudante são pseudonimizados.
- **Qualidade:** `npm run lint` com zero avisos e `flake8` sem erros são exigidos pelo CI.
