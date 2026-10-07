#!/bin/bash
# Backup diário do PostgreSQL (agende no cron: 0 3 * * * /caminho/deploy/backup.sh)
set -e
cd "$(dirname "$0")"
mkdir -p backups
docker compose exec -T db pg_dump -U divan -Fc divan_links > "backups/divan-$(date +%F).dump"
find backups -name 'divan-*.dump' -mtime +14 -delete
# Restaurar: docker compose exec -T db pg_restore -U divan -d divan_links --clean < backups/ARQUIVO.dump
