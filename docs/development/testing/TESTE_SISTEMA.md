# 🧪 GUIA DE TESTE DO SISTEMA

## 1. Iniciar Servidores

### Backend:
```bash
cd backend
python app.py
```
Deve mostrar: `Running on http://localhost:5000`

### Frontend:
```bash
cd frontend
npm start
```
Deve abrir: `http://localhost:3000`

---

## 2. Testes a Realizar

### ✅ Teste 1: Latência da IA
1. Abra o Console (F12)
2. Jogue qualquer jogo
3. Verifique logs: `[IA Performance] Latência: Xms | Score: Y%`
4. **Meta:** Latência < 50ms

### ✅ Teste 2: Tempo de Reação
1. Jogue "Mestres do Sinal"
2. Clique nos sinais verdes
3. Console deve mostrar tempos de reação
4. **Meta:** Precisão ±10ms

### ✅ Teste 3: Detector de Cascata
1. Jogue qualquer jogo
2. Erre propositalmente 4+ vezes seguidas
3. Console deve mostrar: `Cascata de erros detectada!`
4. **Meta:** Detecta em < 100ms

### ✅ Teste 4: Botão de Emergência
1. Durante o jogo, clique no botão vermelho "PARAR" (canto superior direito)
2. Todos sons devem parar
3. Animações devem parar
4. **Meta:** Para tudo instantaneamente

### ✅ Teste 5: Modo Offline
1. Inicie um jogo
2. Desconecte a internet (WiFi off)
3. Continue jogando
4. Reconecte a internet
5. Dados devem sincronizar
6. **Meta:** Funciona 100% offline

### ✅ Teste 6: Responsividade
1. Redimensione a janela
2. Teste em diferentes resoluções
3. Teste no mobile (F12 > Device Toolbar)
4. **Meta:** Funciona em todas as resoluções

---

## 3. Verificar Console

Abra Console (F12) e procure por:

```
✅ [IA Performance] Latência: 2.45ms | Score: 85.3%
✅ Service Worker registrado
✅ Tempo de reação: 450ms
⚠️ IA Latency HIGH: 55ms (se > 50ms)
⚠️ Cascata de erros detectada! { consecutiveErrors: 4 }
```

---

## 4. Verificar Dados Salvos

### LocalStorage:
1. F12 > Application > Local Storage
2. Verificar: `offlineQueue`, `token`, `user`

### Backend:
```bash
# Verificar se dados foram salvos
curl http://localhost:5000/api/progresso
```

---

## 5. Problemas Comuns

### Backend não inicia:
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend não inicia:
```bash
cd frontend
npm install
npm start
```

### Porta ocupada:
```bash
# Matar processo na porta 3000
npx kill-port 3000

# Matar processo na porta 5000
npx kill-port 5000
```

### Service Worker não registra:
1. F12 > Application > Service Workers
2. Clique em "Unregister"
3. Recarregue a página (Ctrl+R)

---

## 6. Métricas Esperadas

| Métrica | Meta | Como Verificar |
|---------|------|----------------|
| Latência IA | < 50ms | Console logs |
| Tempo de Reação | ±10ms | Console logs |
| Detecção Cascata | < 100ms | Console logs |
| Botão Emergência | Instantâneo | Teste manual |
| Modo Offline | 100% | Desconectar WiFi |
| FPS | > 30 | Jogos 3D |

---

## 7. Checklist Final

- [ ] Backend rodando (porta 5000)
- [ ] Frontend rodando (porta 3000)
- [ ] Console sem erros críticos
- [ ] Latência IA < 50ms
- [ ] Tempo de reação capturado
- [ ] Cascata detectada
- [ ] Botão emergência funciona
- [ ] Modo offline funciona
- [ ] Service Worker registrado
- [ ] Dados salvos no backend

---

## 8. Próximos Passos

Após todos os testes passarem:

1. ✅ Executar auditoria WCAG
2. ✅ Atualizar backend para aceitar novos campos
3. ✅ Testar com banco de dados real
4. ✅ Preparar documentação para comitê de ética
5. ✅ Recrutar participantes para estudo piloto

---

**Status:** Pronto para teste  
**Data:** 10/02/2026  
**Versã