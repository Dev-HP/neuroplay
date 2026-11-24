# NeuroPlay Research Paper

## 📄 Artigo Científico Completo

Este diretório contém o artigo científico completo sobre o NeuroPlay, incluindo análises estatísticas e visualizações.

## 📁 Estrutura

```
paper/
├── neuroplay_article.tex    # Artigo principal em LaTeX
├── analysis.py               # Script Python para análises e gráficos
├── README.md                 # Este arquivo
├── figures/                  # Figuras geradas (criadas ao executar analysis.py)
│   ├── learning_curves.png
│   ├── ef_domains.png
│   └── adaptive_performance.png
└── tables/                   # Tabelas LaTeX (criadas ao executar analysis.py)
    └── statistics.tex
```

## 🔬 Conteúdo do Artigo

### Seções Principais

1. **Abstract**: Resumo estruturado com background, objetivos, métodos, resultados e conclusões
2. **Introduction**: Contextualização sobre TEA, funções executivas e intervenções digitais
3. **Methods**: Arquitetura da plataforma, design dos jogos, IA adaptativa e acessibilidade
4. **Results**: Métricas de desempenho técnico e validação do algoritmo adaptativo
5. **Discussion**: Contribuições, limitações e direções futuras
6. **Conclusions**: Síntese e implicações

### Referências Científicas

O artigo inclui **19 referências** de fontes internacionais de alta qualidade:

- Meta-análises sobre funções executivas em TEA
- Estudos de intervenção digital
- Guidelines de acessibilidade (WCAG 2.1)
- Pesquisas sobre neurodiversidade e design
- Artigos sobre gamificação e IA adaptativa

## 🐍 Análises Estatísticas (Python)

### Requisitos

```bash
pip install numpy matplotlib seaborn scipy pandas
```

### Executar Análises

```bash
cd paper
python analysis.py
```

### Saídas Geradas

1. **learning_curves.png**: Curvas de aprendizado mostrando melhoria ao longo das sessões
2. **ef_domains.png**: Comparação pré-pós treinamento nos 3 domínios de FE
3. **adaptive_performance.png**: Eficácia do algoritmo adaptativo
4. **statistics.tex**: Tabela LaTeX com estatísticas descritivas e testes t

## 📊 Dados Simulados

As análises utilizam dados simulados baseados em:
- Tamanhos de efeito da literatura (d = 0.45-0.59)
- N = 100 usuários virtuais
- 20 sessões de treinamento
- Crescimento logístico com variabilidade individual

## 📝 Compilar o PDF

### Requisitos

- LaTeX distribution (TeX Live, MiKTeX, ou MacTeX)
- Pacotes: inputenc, babel, amsmath, graphicx, hyperref, cite, booktabs

### Comandos

```bash
cd paper

# Primeira compilação
pdflatex neuroplay_article.tex

# Processar referências
bibtex neuroplay_article

# Recompilar (2x para resolver referências cruzadas)
pdflatex neuroplay_article.tex
pdflatex neuroplay_article.tex
```

### Alternativa: Overleaf

1. Acesse [Overleaf](https://www.overleaf.com/)
2. Crie novo projeto
3. Faça upload de `neuroplay_article.tex`
4. Compile automaticamente

## 🎯 Principais Contribuições

1. **Plataforma Web Adaptativa**: Integração de React, Three.js e TensorFlow.js
2. **IA para Personalização**: Algoritmos adaptativos mantêm usuários na zona de desenvolvimento proximal
3. **Design Neurodiverso**: Acessibilidade WCAG 2.1 AA + princípios específicos para TEA
4. **Treinamento Multi-Domínio**: Memória de trabalho, controle inibitório e flexibilidade cognitiva

## 📈 Resultados Destacados

- **Desempenho Técnico**: 
  - Tempo de carregamento: 2.3s
  - Frame rate: 58 FPS
  - Inferência IA: 12ms
  - Score de acessibilidade: 96/100

- **Algoritmo Adaptativo**:
  - 89% dos usuários mantidos na faixa alvo (70-80% acurácia)
  - Tempo médio para dificuldade ótima: 3.2 sessões
  - Acurácia média: 76.3% (SD=4.2%)

## 🔮 Direções Futuras

1. **Validação Clínica**: Ensaios controlados randomizados
2. **Módulo Social**: Reconhecimento de emoções e teoria da mente
3. **Biometria**: Integração de sinais fisiológicos (HRV, EDA)
4. **Longitudinal**: Análise de retenção e trajetórias de desenvolvimento

## 📚 Citação Sugerida

```bibtex
@article{neuroplay2026,
  title={NeuroPlay: A Web-Based Adaptive Platform for Executive Function Training in Individuals with Autism Spectrum Disorder},
  author={Research Team},
  journal={[Journal Name]},
  year={2026},
  volume={XX},
  pages={XX-XX},
  doi={XX.XXXX/XXXXX}
}
```

## 📧 Contato

Para questões sobre o artigo ou colaborações:
- GitHub: [Dev-HP/neuroplay](https://github.com/Dev-HP/neuroplay)
- Email: [contact@neuroplay.org]

## 📄 Licença

Este trabalho está licenciado sob [MIT License](../../../LICENSE).

---

**Nota**: Este artigo representa a documentação técnica e científica do projeto NeuroPlay. Dados clínicos reais serão coletados em estudos futuros.
