# Estrutura do projeto

```text
neuroplay/
├── backend/
│   ├── app.py                 API Flask v1: modelos, autenticação, RBAC, consentimento, gameplay, relatórios
│   ├── wsgi.py                Entrypoint WSGI (gunicorn)
│   ├── ai_engine.py           Motor de recomendação (opcional)
│   ├── telemetry_service.py   Telemetria em lote
│   ├── tests/                 Pytest (contratos da API, entidades, telemetria)
│   ├── requirements*.txt
│   └── Dockerfile, entrypoint.sh
├── frontend/
│   ├── public/                index.html, favicon (logo), service worker
│   └── src/
│       ├── App.js             Rotas
│       ├── pages/             Login, PainelAluno, PainelEducador
│       ├── games/
│       │   ├── MestresDoSinal/    Go/No-Go
│       │   ├── CacadorDeAlvos/    Busca visual (Three.js)
│       │   ├── MemoriaDupla/      n-back
│       │   ├── CyberRunner/       Corrida com escolha rápida (canvas)
│       │   ├── EchoTemple/        Sequência visuoespacial (canvas)
│       │   ├── SonicJump/         Fonemas (canvas)
│       │   ├── GravityLab/        Troca de regra (canvas)
│       │   └── shared/            Feedback e telemetria dos jogos
│       ├── features/achievements/ Sistema de conquistas
│       ├── shared/
│       │   ├── adaptation/        Dificuldade adaptativa compartilhada
│       │   ├── api/               Cliente de gameplay
│       │   ├── components/        Logo, GameControls, EmergencyStop, SensorySettings…
│       │   ├── config/api.js      URL da API e modo demonstração
│       │   ├── demo/              Backend local do modo demonstração
│       │   ├── sync/, db/         Fila offline e IndexedDB
│       │   └── utils/             Áudio, adaptação local, detector de erros em cascata
│       └── store/                 Zustand
├── database/schema.sql
├── docs/                      Índice em docs/README.md
├── legacy/pygame/             Protótipos desktop (fora do produto)
├── scripts/                   Apoio a CI, deploy e testes
├── tests/load/                Locust
└── .github/workflows/         CI e deploy no GitHub Pages
```

## Convenções

- **Um jogo por pasta** em `frontend/src/games/<Nome>/`, com `.js` e `.css` próprios.
- **CSS escopado:** toda regra de um componente começa pela classe raiz do componente (por exemplo, `.jogo-container .btn-large`). O CRA junta todo o CSS num arquivo só; sem o escopo, classes como `.btn-primary` vazam entre telas.
- **Estado de jogos em canvas** vive em `gameRef` e é criado uma única vez; o `useEffect` principal não pode recriá-lo.
- **Salvamento:** toda partida termina por um fim natural ou pelo botão "Encerrar", e grava só se houve jogada.
- **Dados:** nada identificável em fixtures; perfis de estudante são pseudonimizados.
