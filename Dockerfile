# Divan Logística · Protótipo estático
# Servido por nginx Alpine (imagem leve, ~50MB)
FROM nginx:1.27-alpine

# Remove a config default e usa a customizada
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia o conteúdo estático
COPY . /usr/share/nginx/html

# Remove arquivos que não precisam ir pra produção
RUN rm -rf /usr/share/nginx/html/Dockerfile \
           /usr/share/nginx/html/.dockerignore \
           /usr/share/nginx/html/nginx.conf \
           /usr/share/nginx/html/.git \
           /usr/share/nginx/html/README.md

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
