# Guia de Contribuição - NeuroPlay

Obrigado por considerar contribuir com o NeuroPlay! 🎉

## 🤝 Como Contribuir

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/[seu-usuario]/neuroplay.git
cd neuroplay

# Adicione o repositório original como upstream
git remote add upstream https://github.com/[original]/neuroplay.git
```

### 2. Crie uma Branch

```bash
# Atualize sua main
git checkout main
git pull upstream main

# Crie uma branch para sua feature
git checkout -b feature/nome-da-feature
```

### 3. Faça suas Alterações

- Siga os padrões de código do projeto
- Adicione testes se aplicável
- Atualize a documentação

### 4. Commit suas Mudanças

```bash
# Adicione os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona novo jogo de memória"
```

#### Padrão de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

### 5. Push para o GitHub

```bash
git push origin feature/nome-da-feature
```

### 6. Abra um Pull Request

1. Vá para o repositório no GitHub
2. Clique em "Pull Request"
3. Descreva suas mudanças
4. Aguarde review

## 📋 Checklist do PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passando
- [ ] Documentação atualizada
- [ ] Commits seguem o padrão
- [ ] Branch atualizada com main

## 🎨 Padrões de Código

### JavaScript/React

```javascript
// Use arrow functions
const Component = () => {
  // Hooks no topo
  const [state, setState] = useState();
  
  // Funções auxiliares
  const handleClick = () => {};
  
  // Return
  return <div>...</div>;
};

// Export default no final
export default Component;
```

### Python

```python
# PEP 8
def function_name(param1, param2):
    """Docstring descrevendo a função."""
    result = param1 + param2
    return result

# Type hints quando possível
def typed_function(name: str, age: int) -> dict:
    return {"name": name, "age": age}
```

### CSS

```css
/* BEM naming */
.block {}
.block__element {}
.block--modifier {}

/* Mobile-first */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}
```

## 🧪 Testes

### Frontend

```bash
cd frontend
npm test
```

### Backend

```bash
cd backend
pytest
```

## 📝 Documentação

- Atualize README.md se necessário
- Adicione JSDoc/Docstrings
- Atualize docs/ se aplicável

## 🐛 Reportando Bugs

Use o template de issue:

```markdown
**Descrição do Bug**
Descrição clara do problema

**Como Reproduzir**
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

**Comportamento Esperado**
O que deveria acontecer

**Screenshots**
Se aplicável

**Ambiente**
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 120]
- Versão: [e.g. 1.0.0]
```

## 💡 Sugerindo Features

Use o template de feature request:

```markdown
**Problema que Resolve**
Descrição do problema

**Solução Proposta**
Como você resolveria

**Alternativas Consideradas**
Outras opções

**Contexto Adicional**
Qualquer outra informação
```

## 🎯 Áreas para Contribuir

### Jogos
- Implementar novos jogos terapêuticos
- Melhorar jogos existentes
- Adicionar níveis de dificuldade

### IA
- Melhorar algoritmos de adaptação
- Adicionar novos insights
- Otimizar performance

### UI/UX
- Melhorar acessibilidade
- Adicionar animações
- Otimizar para mobile

### Backend
- Adicionar endpoints
- Melhorar performance
- Implementar cache

### Documentação
- Traduzir documentação
- Adicionar tutoriais
- Melhorar exemplos

## 🏆 Reconhecimento

Contribuidores serão adicionados ao README.md!

## 📞 Dúvidas?

- Abra uma issue
- Entre em contato: [email]

---

Obrigado por contribuir! 🙏
