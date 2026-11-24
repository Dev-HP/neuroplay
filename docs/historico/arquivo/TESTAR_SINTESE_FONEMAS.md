# 🎵 Guia de Teste - Síntese de Fonemas (Sonic Jump)

## 🚀 Início Rápido

```bash
# 1. Inicie o frontend
cd frontend
npm start

# 2. Abra http://localhost:3000
# 3. Navegue para Sonic Jump
# 4. Pressione ESPAÇO para começar
# 5. Clique na tela (ativa áudio)
```

---

## 🎧 Teste 1: Reprodução Automática

**Objetivo:** Verificar que o fonema toca automaticamente

**Passos:**
1. Inicie o jogo
2. Clique na tela (ativa Web Audio API)
3. Observe o painel de som aparecer
4. **Ouça:** Som do fonema deve tocar automaticamente
5. Observe ondas sonoras animadas

**Resultado esperado:**
- ✅ Som toca imediatamente
- ✅ Painel mostra fonema (/B/, /P/, etc.)
- ✅ Ondas sonoras animadas
- ✅ Indicador "🎧 Ouça o som!"
- ✅ Timer contando regressivamente

**Se não funcionar:**
- Verifique se clicou na tela primeiro
- Abra Console (F12) e procure por erros
- Verifique se navegador permite áudio

---

## 🔁 Teste 2: Função Replay (Tecla R)

**Objetivo:** Verificar que pode ouvir o som novamente

**Passos:**
1. Durante exibição do som
2. Pressione tecla **R**
3. Som deve tocar novamente
4. Timer deve resetar

**Resultado esperado:**
- ✅ Som toca novamente ao pressionar R
- ✅ Timer reseta para pelo menos 2 segundos
- ✅ Pode pressionar R múltiplas vezes
- ✅ Instrução "Pressione R para ouvir novamente" visível

**Console esperado:**
```
[SonicJump] Replaying phoneme: /B/
```

---

## 🎯 Teste 3: Diferenciação de Fonemas

**Objetivo:** Verificar que cada fonema soa diferente

### Plosivas Vozeadas (B, D)

**Características:**
- Tom periódico (vibração)
- Explosão inicial
- Duração ~150ms

**Teste:**
1. Jogue até aparecer /B/
2. Ouça: Tom + explosão
3. Jogue até aparecer /D/
4. Ouça: Tom + explosão (mais agudo que B)

### Plosivas Surdas (P, T)

**Características:**
- Explosão inicial
- Aspiração (sopro)
- Sem tom periódico
- Duração ~120ms

**Teste:**
1. Jogue até aparecer /P/
2. Ouça: Explosão + sopro
3. Jogue até aparecer /T/
4. Ouça: Explosão + sopro (mais agudo que P)

### Fricativas Vozeadas (V, Z)

**Características:**
- Ruído contínuo
- Tom periódico
- Duração ~200ms

**Teste:**
1. Jogue até aparecer /V/
2. Ouça: Ruído + tom (grave)
3. Jogue até aparecer /Z/
4. Ouça: Ruído + tom (agudo, chiado)

### Fricativas Surdas (F, S)

**Características:**
- Ruído contínuo
- Sem tom periódico
- Duração ~180-250ms

**Teste:**
1. Jogue até aparecer /F/
2. Ouça: Ruído puro (grave)
3. Jogue até aparecer /S/
4. Ouça: Ruído puro (agudo, chiado)

---

## 🔊 Teste 4: Pares Mínimos

**Objetivo:** Distinguir sons muito parecidos

### Par 1: /B/ vs /P/

**Diferença:** Vozeamento

**Teste:**
1. Ouça /B/ → Tom + explosão
2. Ouça /P/ → Explosão + aspiração
3. **Desafio:** Feche os olhos e identifique qual é qual

**Dica:** /B/ tem "zumbido", /P/ tem "sopro"

### Par 2: /D/ vs /T/

**Diferença:** Vozeamento

**Teste:**
1. Ouça /D/ → Tom + explosão
2. Ouça /T/ → Explosão + aspiração
3. **Desafio:** Identifique sem olhar

**Dica:** /D/ tem "zumbido", /T/ tem "sopro"

### Par 3: /V/ vs /F/

**Diferença:** Vozeamento

**Teste:**
1. Ouça /V/ → Ruído + tom
2. Ouça /F/ → Ruído puro
3. **Desafio:** Qual tem "zumbido"?

**Dica:** /V/ vibra, /F/ sopra

### Par 4: /S/ vs /Z/

**Diferença:** Vozeamento

**Teste:**
1. Ouça /S/ → Chiado puro
2. Ouça /Z/ → Chiado + tom
3. **Desafio:** Qual tem "zumbido"?

**Dica:** /Z/ vibra, /S/ sopra

---

## 🎮 Teste 5: Integração com Gameplay

**Objetivo:** Verificar que tudo funciona junto

**Passos:**
1. Inicie jogo
2. Ouça fonema
3. Pressione R para replay (opcional)
4. Pule para plataforma correta
5. **Ouça:** Feedback auditivo ao acertar
6. Observe: Partículas e pontuação
7. Próximo desafio aparece
8. Repita

**Resultado esperado:**
- ✅ Fonema toca automaticamente
- ✅ Replay funciona (R)
- ✅ Feedback ao acertar/errar
- ✅ Progressão suave
- ✅ Sem travamentos

---

## 🔧 Teste 6: Configurações Sensoriais

**Objetivo:** Verificar que volume ajusta

**Passos:**
1. No menu, pressione C
2. Tab "Auditivo"
3. Ajuste volume para 30%
4. Salve
5. Jogue
6. **Ouça:** Sons mais baixos
7. Abra configurações novamente
8. Ajuste volume para 100%
9. Salve
10. **Ouça:** Sons mais altos

**Resultado esperado:**
- ✅ Volume ajusta corretamente
- ✅ Configuração persiste
- ✅ Fonemas e feedback afetados

---

## 🧪 Teste 7: Console do Navegador

**Objetivo:** Testar síntese diretamente

**Passos:**
1. Abra Console (F12)
2. Cole o código abaixo:

```javascript
// Importa e inicializa
import { getPhonemeSynthesizer } from './utils/phonemeSynthesizer';

const synth = getPhonemeSynthesizer();
await synth.init();

// Testa todos os fonemas
console.log('Testando /B/...');
synth.playPhoneme('/B/', 0.8);

setTimeout(() => {
  console.log('Testando /P/...');
  synth.playPhoneme('/P/', 0.8);
}, 1000);

setTimeout(() => {
  console.log('Testando /D/...');
  synth.playPhoneme('/D/', 0.8);
}, 2000);

setTimeout(() => {
  console.log('Testando /T/...');
  synth.playPhoneme('/T/', 0.8);
}, 3000);

setTimeout(() => {
  console.log('Testando /V/...');
  synth.playPhoneme('/V/', 0.8);
}, 4000);

setTimeout(() => {
  console.log('Testando /F/...');
  synth.playPhoneme('/F/', 0.8);
}, 5000);

setTimeout(() => {
  console.log('Testando /S/...');
  synth.playPhoneme('/S/', 0.8);
}, 6000);

setTimeout(() => {
  console.log('Testando /Z/...');
  synth.playPhoneme('/Z/', 0.8);
}, 7000);

// Informações sobre fonemas
console.log('Informações:', synth.getPhonemeInfo('/B/'));
console.log('Todos os fonemas:', synth.getAllPhonemes());
```

**Resultado esperado:**
- ✅ Cada fonema toca com 1 segundo de intervalo
- ✅ Console mostra logs
- ✅ Informações dos fonemas aparecem

---

## 📊 Teste 8: Performance

**Objetivo:** Verificar que não há lag

**Passos:**
1. Jogue por 5 minutos
2. Observe FPS (deve estar > 30)
3. Ouça sons (devem tocar sem atraso)
4. Verifique memória (F12 → Performance)

**Resultado esperado:**
- ✅ FPS estável (> 30)
- ✅ Sem atraso de áudio
- ✅ Memória estável (não aumenta)
- ✅ Sem travamentos

---

## 🐛 Problemas Comuns

### Áudio não toca

**Causa:** Web Audio API requer interação do usuário

**Solução:**
1. Clique na tela antes de jogar
2. Ou pressione qualquer tecla
3. Verifique console para erros

### Sons muito baixos

**Causa:** Volume nas configurações

**Solução:**
1. Pressione C
2. Tab "Auditivo"
3. Aumente volume para 80-100%
4. Salve

### Sons distorcidos

**Causa:** Volume muito alto ou múltiplas instâncias

**Solução:**
1. Reduza volume para 70%
2. Recarregue página (F5)
3. Verifique se não há múltiplas abas abertas

### Replay não funciona

**Causa:** Pressionando R fora do painel de som

**Solução:**
1. Pressione R apenas quando painel está visível
2. Verifique console para logs

### Fonemas soam iguais

**Causa:** Pode ser difícil distinguir sem treino

**Solução:**
1. Use fones de ouvido
2. Aumente volume
3. Foque nas diferenças:
   - Vozeados têm "zumbido"
   - Surdos têm "sopro"
   - Plosivas têm "explosão"
   - Fricativas têm "ruído contínuo"

---

## ✅ Checklist de Teste

Marque cada item após testar:

### Funcionalidade Básica
- [ ] Fonema toca automaticamente
- [ ] Painel de som aparece
- [ ] Timer funciona
- [ ] Ondas sonoras animadas
- [ ] Instrução de replay visível

### Replay
- [ ] Tecla R funciona
- [ ] Som toca novamente
- [ ] Timer reseta
- [ ] Pode pressionar múltiplas vezes

### Diferenciação
- [ ] /B/ soa diferente de /P/
- [ ] /D/ soa diferente de /T/
- [ ] /V/ soa diferente de /F/
- [ ] /S/ soa diferente de /Z/
- [ ] Plosivas têm explosão
- [ ] Fricativas têm ruído contínuo

### Integração
- [ ] Feedback ao acertar
- [ ] Feedback ao errar
- [ ] Progressão funciona
- [ ] Sem travamentos
- [ ] Performance boa (> 30 FPS)

### Configurações
- [ ] Volume ajusta
- [ ] Configuração persiste
- [ ] Desativar funciona

### Console
- [ ] Sem erros
- [ ] Logs aparecem
- [ ] Teste direto funciona

---

## 🎯 Critérios de Sucesso

**Teste passa se:**
- ✅ Todos os 8 fonemas tocam
- ✅ Sons são distinguíveis
- ✅ Replay funciona
- ✅ Integração com gameplay funciona
- ✅ Configurações ajustam volume
- ✅ Performance é boa
- ✅ Sem erros no console

**Teste falha se:**
- ❌ Algum fonema não toca
- ❌ Sons são indistinguíveis
- ❌ Replay não funciona
- ❌ Travamentos ou lag
- ❌ Erros no console

---

## 📈 Próximos Passos

Após testar:

1. **Se tudo funciona:**
   - ✅ Marque Fase 1 como completa
   - ✅ Inicie testes com usuários reais
   - ✅ Colete feedback
   - ✅ Prossiga para Fase 2

2. **Se encontrar bugs:**
   - 📝 Anote o problema
   - 📸 Tire screenshot
   - 📋 Copie erro do console
   - 🔧 Reporte para correção

3. **Melhorias sugeridas:**
   - 💡 Anote ideias
   - 📊 Priorize por impacto
   - 🗓️ Planeje implementação

---

## 🎊 Parabéns!

Se todos os testes passaram, você tem:

- ✅ Síntese de fonemas real funcionando
- ✅ 8 fonemas distinguíveis
- ✅ Função de replay
- ✅ Integração completa
- ✅ Fase 1 - 100% completa!

**Próximo:** Teste com usuários reais ou inicie Fase 2!

---

**Dica Final:** Use fones de ouvido para melhor experiência de áudio! 🎧
