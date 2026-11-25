# Como contribuir

## Fluxo

1. Faça um fork e crie uma branch a partir da `develop`: `git checkout -b feat/nome-curto`.
2. Rode o projeto seguindo [`docs/guias/INSTALACAO.md`](docs/guias/INSTALACAO.md).
3. Antes de abrir o pull request, rode as mesmas verificações do CI:

   ```bash
   cd frontend && npm run lint && npm test && npm run build
   cd backend && flake8 . && pytest
   ```

4. Abra o pull request para a `develop`, descrevendo o que mudou e como testou.

Mensagens de commit seguem [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## Convenções do código

- Um jogo por pasta em `frontend/src/games/<Nome>/`; regras de CSS começam pela classe raiz do componente.
- ESLint sem avisos (`--max-warnings=0`) e flake8 sem apontamentos.
- Testes testam código do app (importam o módulo testado); nada de testar valores criados no próprio teste.
- Documentos em `docs/` descrevem o estado atual; atualize-os junto com o código.

Mais detalhes em [`docs/arquitetura/PROJECT_STRUCTURE.md`](docs/arquitetura/PROJECT_STRUCTURE.md).

## Dados e limites do produto

- Nunca coloque dados pessoais, clínicos ou identificáveis em código, fixtures, issues ou capturas de tela.
- O NeuroPlay não é dispositivo médico: textos e telas não podem prometer diagnóstico, tratamento ou melhora clínica.
- Vulnerabilidades: siga o [`SECURITY.md`](SECURITY.md), não abra issue pública.
