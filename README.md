# Divan Logística · Protótipo navegável

Protótipo HTML/React do **Sistema de Logística Inteligente da Divan Móveis**, pronto pra ser apresentado e vendido. Roda em qualquer navegador desktop moderno — sem build, sem backend.

**Domínio alvo:** `divan.leafgrp.com.br`
**Hospedagem:** EasyPanel da Leaf (`62.146.227.190`)
**DNS:** Cloudflare (NS: brianna/agustin.ns.cloudflare.com)

---

## O que tem no protótipo

| Tela | Arquivo | Para quem |
|------|---------|-----------|
| 🏠 **Hub da demo** | [index.html](index.html) | Ponto de entrada — 4 cards levam pros apps |
| 🖥️ **Painel Administrativo** | [admin.html](admin.html) | Operadores Divan (desktop) |
| 🚚 **App do Motorista** | [motorista.html](motorista.html) | Motoristas (mostrado em device-frame no desktop) |
| 🔧 **App do Montador** | [montador.html](montador.html) | Montadores parceiros (idem) |
| ⭐ **Portal do Cliente** | [cliente.html](cliente.html) | Cliente final via WhatsApp (idem) |

Todos os apps têm um botão "← Hub da demo" fixo no canto superior esquerdo pra navegação fluida durante a apresentação.

---

## Como rodar localmente

```bash
cd /Users/danielcordeiro/Projetos_Claude/divan-logistica-demo
python3 -m http.server 8080
# Abre http://localhost:8080
```

Ou via Docker:

```bash
docker build -t divan-demo .
docker run --rm -p 8080:80 divan-demo
# Abre http://localhost:8080
```

---

## Deploy no EasyPanel (passo a passo)

### 1️⃣ Subir o código (uma das opções)

**Opção A — Git push** (recomendado se você tem repo):
```bash
cd /Users/danielcordeiro/Projetos_Claude/divan-logistica-demo
git init -b main
git add .
git commit -m "feat: protótipo navegável Divan Logística"
# crie repo no GitHub primeiro, depois:
git remote add origin git@github.com:agencialeaf/divan-logistica-demo.git
git push -u origin main
```

**Opção B — Upload manual no EasyPanel:**
EasyPanel aceita upload de tarball direto na UI do service.

### 2️⃣ Criar o service no EasyPanel

1. Acesse o painel EasyPanel da Leaf
2. **+ Service → App**
3. Configurações:
   - **Name:** `divan-logistica-demo`
   - **Source:** Git (cole URL do repo) ou Upload
   - **Build:** Dockerfile (já existe na raiz)
   - **Port:** `80`
4. Em **Domains**, adicione: `divan.leafgrp.com.br`
   - EasyPanel gera SSL automático via Let's Encrypt (Traefik)
5. **Deploy**

### 3️⃣ Configurar DNS no Cloudflare

1. Acesse o Cloudflare → domínio `leafgrp.com.br`
2. **DNS → Add record**:
   - **Type:** `A`
   - **Name:** `divan`
   - **IPv4:** `62.146.227.190`
   - **Proxy:** 🟠 Proxied (recomendado — habilita CDN + cache + HTTPS reforçado)
   - **TTL:** Auto
3. Salvar
4. Aguardar propagação (geralmente 1–5 min com Cloudflare)

> ⚠️ **Se preferir Proxy DNS Only (cinza):** Use quando quiser que o Let's Encrypt do EasyPanel resolva o cert direto. Depois de o SSL estar ativo, pode trocar pra Proxied. Em proxied, certifique que **SSL/TLS encryption mode = Full** no Cloudflare (não Flexible).

### 4️⃣ Testar

```bash
curl -I https://divan.leafgrp.com.br
# Esperado: HTTP/2 200, server: nginx
```

Abra `https://divan.leafgrp.com.br` no navegador.

---

## Estrutura do projeto

```
divan-logistica-demo/
├── index.html              # 🏠 Hub principal (entrada)
├── admin.html              # 🖥️ Painel administrativo
├── motorista.html          # 🚚 App motorista (device-frame)
├── montador.html           # 🔧 App montador (device-frame)
├── cliente.html            # ⭐ Portal cliente (device-frame)
│
├── tokens.css              # Design tokens (cores, tipografia, espaçamento)
├── design-system.css       # Componentes base
├── extras-admin.css        # Estilos do painel admin
├── extras-cargas.css       # Estilos da Gestão de Cargas
├── extras-mapa.css         # Mapa operacional
├── extras-nps.css          # Dashboard NPS + portal cliente
├── extras-motorista.css    # App motorista
├── extras-montador.css     # App montador
├── hub-button.css          # Botão "voltar ao hub" injetado em cada app
│
├── admin-login.jsx         # JSX dos componentes admin
├── admin-dashboard.jsx
├── admin-cargas.jsx
├── admin-extra-pages.jsx
├── nps-screens.jsx
├── motorista-screens.jsx
├── montador-screens.jsx
├── design-canvas.jsx       # Showcase do design system
│
├── assets/                 # Logos (white, black, color)
├── uploads/                # Fotos mock de produto
│
├── Dockerfile              # Container nginx Alpine
├── nginx.conf              # Config nginx (gzip, cache, headers)
├── .dockerignore
├── .gitignore
└── README.md
```

---

## Stack técnica

- **HTML5 + CSS3** (vanilla, sem framework)
- **React 18.3** via CDN (unpkg) — sem build
- **Babel Standalone** transpilando JSX no navegador — sem build
- **Inter** (Google Fonts)
- **nginx 1.27 Alpine** servindo estático
- **EasyPanel** (Docker host)

Tudo via CDN com Subresource Integrity (SRI). Zero dependências de build. Trocar uma tela = editar `.jsx` e dar refresh.

---

## Próximos passos (se a Divan aprovar)

Quando a Divan fechar contrato, migramos pra projeto Next.js de verdade:
- Backend Supabase (auth, banco, realtime)
- API tRPC
- Integração Google Maps Routes (roteirização real)
- Integração WhatsApp Cloud API
- Conexão com ERP da Divan
- Apps mobile nativos via Expo (se necessário) ou PWA

Base de partida: `/Users/danielcordeiro/Projetos_Claude/divan-logistica/` (Next.js já bootado).

---

*Protótipo v1.0 · Leaf · 2026-05-10*
