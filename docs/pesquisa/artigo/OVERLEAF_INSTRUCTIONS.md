# 🚀 Guia Rápido: Upload para Overleaf

## 📦 Passo 1: Preparar Arquivos

Você precisa fazer upload destes arquivos para o Overleaf:

### Arquivo Principal
- ✅ `neuroplay_article.tex` (artigo completo)

### Pasta de Figuras
- ✅ `figures/learning_curves.png`
- ✅ `figures/ef_domains.png`
- ✅ `figures/adaptive_performance.png`

### Pasta de Tabelas
- ✅ `tables/statistics.tex`

---

## 🌐 Passo 2: Acessar Overleaf

1. **Acesse**: https://www.overleaf.com/
2. **Crie conta gratuita** ou faça login
   - Pode usar Google, ORCID, ou email

---

## 📤 Passo 3: Upload do Projeto

### Opção A: Upload de Arquivo ZIP (Recomendado)

1. No Overleaf, clique em **"New Project"**
2. Selecione **"Upload Project"**
3. Faça upload do arquivo **`neuroplay_overleaf.zip`** (vou criar para você)
4. Aguarde o upload completar
5. O projeto abrirá automaticamente!

### Opção B: Upload Manual (Alternativa)

1. No Overleaf, clique em **"New Project"** → **"Blank Project"**
2. Nomeie: "NeuroPlay Scientific Paper"
3. **Upload do arquivo principal**:
   - Clique no ícone de upload (seta para cima)
   - Selecione `neuroplay_article.tex`
4. **Criar pasta figures**:
   - Clique em "New Folder"
   - Nome: `figures`
   - Upload das 3 imagens PNG dentro desta pasta
5. **Criar pasta tables**:
   - Clique em "New Folder"
   - Nome: `tables`
   - Upload de `statistics.tex` dentro desta pasta

---

## ⚙️ Passo 4: Configurar o Projeto

1. **Definir arquivo principal**:
   - Clique no ícone de menu (☰) ao lado de `neuroplay_article.tex`
   - Selecione **"Set as Main File"**

2. **Configurar compilador** (opcional):
   - Menu superior: **"Menu"** → **"Settings"**
   - Compiler: **pdfLaTeX** (padrão, já está correto)
   - TeX Live version: **2024** (mais recente)

---

## 🔨 Passo 5: Compilar e Visualizar

1. **Clique em "Recompile"** (botão verde no topo)
2. **Aguarde** (primeira compilação pode demorar ~30 segundos)
3. **Visualize o PDF** no painel direito!

### Se houver erros:
- Clique em "Logs and output files"
- Verifique se todas as figuras foram carregadas
- Certifique-se de que as pastas `figures/` e `tables/` existem

---

## 📁 Estrutura Final no Overleaf

```
NeuroPlay Scientific Paper/
├── neuroplay_article.tex    ← Arquivo principal
├── figures/
│   ├── learning_curves.png
│   ├── ef_domains.png
│   └── adaptive_performance.png
└── tables/
    └── statistics.tex
```

---

## ✅ Checklist de Upload

- [ ] Conta criada no Overleaf
- [ ] Projeto criado/uploaded
- [ ] Arquivo `neuroplay_article.tex` carregado
- [ ] Pasta `figures/` criada com 3 imagens
- [ ] Pasta `tables/` criada com `statistics.tex`
- [ ] Arquivo principal definido
- [ ] Primeira compilação bem-sucedida
- [ ] PDF visualizado!

---

## 🎨 Recursos do Overleaf

### Edição em Tempo Real
- Edite o texto no painel esquerdo
- Veja mudanças no PDF automaticamente
- Syntax highlighting para LaTeX

### Colaboração
- **Share** → Adicione colaboradores por email
- Edição simultânea em tempo real
- Comentários e sugestões

### Histórico de Versões
- **History** → Veja todas as mudanças
- Restaure versões anteriores
- Compare diferenças

### Download
- **Menu** → **Download** → **PDF**
- Ou **Source** para baixar todos os arquivos

---

## 🆘 Problemas Comuns

### "Compilation timeout"
**Solução**: Primeira compilação pode demorar. Aguarde e tente novamente.

### "File not found: figures/..."
**Solução**: Certifique-se de que as imagens estão na pasta `figures/` (não na raiz)

### "Undefined control sequence"
**Solução**: Algum pacote LaTeX faltando. Overleaf instala automaticamente, aguarde.

### "Bibliography not found"
**Solução**: Compile 2-3 vezes seguidas para resolver referências.

---

## 🎯 Próximos Passos Após Upload

1. **Revisar o PDF** - Leia o artigo formatado
2. **Fazer edições** - Corrija texto, adicione conteúdo
3. **Compartilhar** - Convide colaboradores
4. **Exportar** - Download do PDF final

---

## 📧 Links Úteis

- **Overleaf**: https://www.overleaf.com/
- **Tutorial Overleaf**: https://www.overleaf.com/learn/how-to/Creating_a_document_in_Overleaf
- **LaTeX Cheat Sheet**: https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes
- **Suporte Overleaf**: https://www.overleaf.com/learn

---

## 🎉 Pronto!

Após seguir estes passos, você terá o artigo científico completo visualizado em PDF profissional no Overleaf!

**Tempo estimado**: 5-10 minutos

**Dificuldade**: ⭐⭐☆☆☆ (Fácil)

---

**💡 Dica**: Salve o link do projeto Overleaf nos favoritos para acesso rápido!
