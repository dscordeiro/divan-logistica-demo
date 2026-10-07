FROM node:22-alpine
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 TRUST_PROXY=true
WORKDIR /app
RUN apk add --no-cache su-exec
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY . .
RUN mkdir -p /app/data && chown -R node:node /app/data && chmod +x /app/docker-entrypoint.sh
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD wget -qO- http://127.0.0.1:3000/health || exit 1
ENTRYPOINT ["/app/docker-entrypoint.sh"]
