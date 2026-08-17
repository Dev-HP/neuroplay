# Multi-stage build para Python
FROM python:3.11-slim AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage de produção
FROM python:3.11-slim

WORKDIR /app

# Instalar apenas runtime dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar código da aplicação
COPY . .

# Criar usuário não-root e instalar dependências em um caminho acessível por ele.
RUN useradd -m -u 1000 appuser
COPY --from=builder /root/.local /home/appuser/.local
RUN chown -R appuser:appuser /app /home/appuser/.local

# Adicionar dependências Python do usuário ao PATH
ENV PATH=/home/appuser/.local/bin:$PATH
RUN chmod +x /app/entrypoint.sh
USER appuser

# Expor porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; response=urllib.request.urlopen('http://localhost:5000/health', timeout=2); raise SystemExit(0 if response.status == 200 else 1)"

# Inicializa o schema real e então inicia a aplicação.
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "wsgi:application"]
