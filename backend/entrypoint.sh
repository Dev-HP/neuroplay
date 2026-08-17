#!/bin/sh
set -eu

if [ "${SKIP_DB_INIT:-false}" != "true" ]; then
  echo "Inicializando schema e catálogo do Neuroplay..."
  flask --app wsgi:application init-db
fi

exec "$@"
