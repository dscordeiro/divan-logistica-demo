#!/bin/sh
# Garante que a pasta de dados (volume) pertence ao usuário sem privilégios e inicia o app com ele
set -e
mkdir -p /app/data
chown -R node:node /app/data
exec su-exec node node /app/server.js
