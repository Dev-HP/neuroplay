# 🔒 Política de Segurança

## Versões Suportadas

| Versão | Suportada          |
| ------ | ------------------ |
| 2.5.x  | :white_check_mark: |
| 2.0.x  | :white_check_mark: |
| < 2.0  | :x:                |

## 🐛 Relatando uma Vulnerabilidade

A segurança do NeuroPlay é levada muito a sério. Se você descobrir uma vulnerabilidade de segurança, por favor siga estas diretrizes:

### ✅ O QUE FAZER

1. **NÃO** abra uma issue pública
2. **Envie um email** para: security@neuroplay.app (ou email do mantenedor)
3. **Inclua** os seguintes detalhes:
   - Descrição da vulnerabilidade
   - Passos para reproduzir
   - Versão afetada
   - Impacto potencial
   - Sugestões de correção (se tiver)

### ⏱️ Tempo de Resposta

- **Confirmação inicial**: 48 horas
- **Avaliação completa**: 7 dias
- **Correção e patch**: Depende da severidade
  - Crítico: 3-7 dias
  - Alto: 7-14 dias
  - Médio: 14-30 dias
  - Baixo: Próximo release

### 🎖️ Reconhecimento

Pesquisadores de segurança que relatarem vulnerabilidades de forma responsável serão:
- Listados no HALL_OF_FAME.md (com permissão)
- Mencionados nos release notes
- Convidados para testar a correção

## 🛡️ Práticas de Segurança

### Autenticação

- JWT com expiração de 24 horas
- Refresh tokens com rotação
- Hashing de senhas com bcrypt (cost factor 12)
- Rate limiting em endpoints de autenticação

### Dados Sensíveis

- **Nunca** armazene senhas em plain text
- **Sempre** use HTTPS em produção
- **Criptografe** dados sensíveis no banco
- **Sanitize** todos os inputs do usuário

### Dependências

- Dependências são atualizadas mensalmente
- Dependabot configurado para alertas automáticos
- Apenas pacotes de fontes confiáveis

### CI/CD

- Secrets gerenciados via GitHub Secrets
- Scans de segurança automatizados (Trivy)
- Análise de código estático
- Testes de penetração regulares

## 🚨 Vulnerabilidades Conhecidas

Nenhuma vulnerabilidade crítica conhecida atualmente.

Veja [CHANGELOG.md](CHANGELOG.md) para correções de segurança anteriores.

## 📋 Checklist de Segurança para Desenvolvedores

Antes de fazer commit:

- [ ] Nenhum secret hardcoded
- [ ] Inputs sanitizados
- [ ] Queries parametrizadas (SQL injection)
- [ ] XSS prevention implementado
- [ ] CSRF tokens em formulários
- [ ] Rate limiting em endpoints sensíveis
- [ ] Logs não expõem dados sensíveis
- [ ] Headers de segurança configurados
- [ ] Dependências atualizadas

## 🔐 Configurações de Segurança

### Headers HTTP (Produção)

```python
# Flask
SECURE_HEADERS = {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'"
}
```

### CORS

```python
# Apenas origens permitidas
CORS_ORIGINS = [
    'https://neuroplay.app',
    'https://www.neuroplay.app'
]
```

### Rate Limiting

```python
# Limites padrão
- Login: 5 tentativas / 15 minutos
- API: 100 requisições / minuto
- Upload: 10 MB max
```

## 📚 Recursos de Segurança

### Ferramentas Usadas

- **Trivy**: Scan de vulnerabilidades em containers
- **Dependabot**: Alertas de dependências
- **Sentry**: Monitoramento de erros
- **GitHub Security**: Alertas de código

### Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

## 📞 Contato

- **Email de Segurança**: security@neuroplay.app
- **PGP Key**: [Link para chave pública]
- **Bug Bounty**: Atualmente não disponível

---

**Última Atualização:** 13/02/2026  
**Versão:** 2.5.0

Obrigado por ajudar a manter o NeuroPlay seguro! 🙏
