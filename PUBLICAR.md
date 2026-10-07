# Publicar o Divan Links

Escolha **um** dos caminhos. Para a fase atual (hospedagem da Leaf), o caminho depende do acesso que a Leaf tem ao servidor.

| Você tem… | Caminho |
|---|---|
| Acesso root/SSH a uma VPS (Ubuntu) | **A. VPS com Docker** (recomendado) |
| Só cPanel com "Setup Node.js App" | **B. cPanel** |

Antes de divulgar qualquer link ou QR Code, **defina o domínio definitivo** (ex.: `alodivan.com.br`). Links impressos com endereço provisório quebram quando o endereço mudar.

---

## A. VPS com Docker (recomendado)

Requisitos: Ubuntu 22.04/24.04, 2 vCPU, 2 GB RAM, portas 80 e 443 livres, domínio apontando para o IP da VPS (registro **A**).

```bash
# 1. Docker (se ainda não tiver)
curl -fsSL https://get.docker.com | sh

# 2. Enviar o projeto (sem node_modules e sem data/) para /opt/divan-links e entrar em deploy/
cd /opt/divan-links/deploy
cp ../.env.example .env
nano .env
```

No `.env`, ajuste:

```
NODE_ENV=production
APP_URL=https://alodivan.com.br
SITE_DOMAIN=alodivan.com.br
APP_SECRET=<rode: openssl rand -hex 48>
POSTGRES_PASSWORD=<rode: openssl rand -hex 24>
ADMIN_EMAIL=daniel@agencialeaf.com.br
ADMIN_PASSWORD=<senha forte inicial>
REQUIRE_2FA=true
```

```bash
# 3. Subir
docker compose up -d --build
docker compose logs -f app      # confira "Divan Links rodando"

# 4. Backup diário às 3h
(crontab -l; echo "0 3 * * * /opt/divan-links/deploy/backup.sh") | crontab -
```

O HTTPS é emitido automaticamente pelo Caddy. Se a VPS já tiver Nginx/Apache usando as portas 80/443, remova o serviço `caddy` do compose, exponha o app (`ports: ["127.0.0.1:3000:3000"]`) e crie um proxy reverso no servidor existente para `http://127.0.0.1:3000`.

**Atualizar:** envie os arquivos novos e rode `docker compose up -d --build`.

**Migrar para a VPS da Divan depois:** rode `backup.sh`, copie o `.dump` e a pasta do projeto, suba na nova VPS, restaure (`pg_restore`, comando no `backup.sh`) e troque o DNS. ~1 hora, sem perder histórico.

---

## B. cPanel ("Setup Node.js App")

1. **Domínios:** crie o domínio/subdomínio e ative o SSL (AutoSSL).
2. **Gerenciador de arquivos:** envie o projeto para `/home/USUARIO/divan-links` (sem `node_modules` e sem `data/`).
3. **Setup Node.js App → Create Application**
   - Node.js version: **20 ou mais nova**
   - Application mode: **Production**
   - Application root: `divan-links`
   - Application URL: o domínio escolhido
   - Application startup file: **`app.cjs`**
   - Environment variables: `NODE_ENV=production`, `APP_URL=https://seu-dominio`, `APP_SECRET=<48+ caracteres aleatórios>`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `TRUST_PROXY=true`
4. Clique em **Run NPM Install** e depois **Restart**.
5. Abra `https://seu-dominio/health`: deve responder `{"ok":true,...}`.

**Banco no cPanel:** se houver "PostgreSQL Databases", crie um banco e um usuário e defina `DATABASE_URL=postgres://usuario:senha@localhost:5432/banco`. Sem PostgreSQL, o app usa o banco embutido na pasta `data/`. Nesse caso, mantenha **uma única instância** do app e faça backup copiando a pasta `data/` com o app parado.

---

## Checklist pós-publicação

- [ ] `https://dominio/` abre no celular e os 5 botões levam ao destino certo
- [ ] Painel: login, ativar 2FA, **trocar a senha inicial**
- [ ] Configurações → adicionar IPs da Leaf e das lojas em "Acessos internos"
- [ ] Configurações → contato de privacidade (LGPD) da Divan
- [ ] Lojas → conferir endereços (Nova Brasília e Alto Novo Parque divergem entre site e Google)
- [ ] Campanhas → criar um link por divulgação antes de publicar
- [ ] Monitoramento: cadastrar `https://dominio/health` num serviço de alerta de queda
- [ ] Backup: confirmar que o primeiro arquivo foi gerado e testar uma restauração
