FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY app.py wsgi.py entrypoint.sh ./
RUN useradd -m -u 1000 appuser \
    && chmod +x /app/entrypoint.sh \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; response=urllib.request.urlopen('http://localhost:5000/health', timeout=2); raise SystemExit(0 if response.status == 200 else 1)"

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "wsgi:application"]
