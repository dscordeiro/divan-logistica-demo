# Divan Links

Página pública de atalhos da Divan Móveis (Televendas, ofertas, lojas, assistência, site, rotas e avaliações no Google) + painel de monitoramento com métricas, campanhas rastreáveis e exportação CSV.

## Rodar no Mac (local)

1. Instale o **Node.js LTS** (versão 20 ou mais nova): https://nodejs.org/pt/download
2. Dê duplo clique em **`Iniciar Divan Links.command`**.
   - Se o Mac bloquear ("desenvolvedor não identificado"): clique com o botão direito no arquivo → **Abrir** → **Abrir**.
   - Na primeira vez, ele instala as dependências (1 a 2 min).
3. Abre sozinho:
   - Página pública: http://localhost:3000
   - Painel: http://localhost:3000/admin
4. **Primeiro acesso ao painel:** e-mail `daniel@agencialeaf.com.br`; a senha aparece na janela do Terminal e fica em `data/PRIMEIRO-ACESSO.txt`. Troque em **Minha conta** e apague o arquivo.

Para ver o painel cheio de dados **fictícios**, use **`Demonstração com dados fictícios.command`** (senha `divan2026demo`). Ele usa a pasta `data-demo/`, separada dos dados reais.

Pelo Terminal: `npm install` e depois `npm start`.

## O que tem

| Área | Endereço | O que faz |
|---|---|---|
| Página pública | `/` | 5 atalhos, lista de lojas com Rota e Avaliar, seção "Avalie no Google", aviso de cookies |
| Clique em atalho | `/r/{atalho}` | Registra o clique no servidor e redireciona (WhatsApp com mensagem, ligação ou link) |
| Link de campanha | `/c/{campanha}` | Registra a entrada e leva campanha + UTMs até o clique. `?go=televendas` vai direto ao WhatsApp |
| Avaliar loja | `/avaliar/{loja}` | Abre a avaliação no Google (use em QR Code no caixa e pós-montagem) |
| Rota | `/rota/{loja}` | Abre a loja no Google Maps |
| Privacidade | `/privacidade` | Política em linguagem simples |
| Painel | `/admin` | Dashboard, Eventos, Campanhas e links, Lojas e Google, Atalhos, Usuários, Auditoria, Configurações |

**Perfis:** Administrador (edita tudo) e Visualizador (consulta métricas, eventos e links; exporta CSV).

## Como a medição funciona

- **Cliques** são contados no servidor (100% confiável, mesmo com bloqueador ou cookies recusados).
- **Acessos** são contados quando a página é carregada; **visualização de botão** é enviada pela página.
- **Sem cookie** por padrão: o visitante é identificado por um código anônimo que muda todo dia. Com o cookie aceito, dá para saber quem voltou.
- **Não grava IP**, user-agent completo, nome, telefone nem conversa.
- **Fora dos relatórios:** robôs e prévias de link (WhatsApp, Facebook…), IPs internos (Configurações) e cliques repetidos em menos de 10 s.
- **Retenção:** eventos detalhados apagados após 180 dias (configurável); ficam totais diários.
- **Localização:** opcional. Baixe o arquivo gratuito *IP to City Lite* (formato MMDB) em https://db-ip.com/db/download/ip-to-city-lite e salve como `data/geo.mmdb`. No celular, a cidade costuma ser a da operadora: use como indicativo.

## Segurança

Senhas com scrypt · verificação em duas etapas (obrigatória para admin em produção) · bloqueio após 5 tentativas · sessão em cookie HttpOnly/SameSite=Strict que expira após 8 h parado · proteção CSRF · limite de requisições · cabeçalhos CSP/HSTS · destinos só do cadastro (sem redirecionamento aberto) · trilha de auditoria · restrição opcional do painel por IP (`ADMIN_ALLOWED_IPS`).

Perdeu o acesso de admin? `npm run create-admin -- email@dominio.com "Nome"`.

## Testes

`npm test` roda 22 testes dos fluxos principais (clique → registro → destino, campanha até o clique, UTMs, robôs, duplicados, IP não gravado, permissões, 2FA, CSRF, bloqueio, CSV, retenção).

## Publicar

Veja **PUBLICAR.md**.

## Estrutura

```
server.js            inicia tudo
app.cjs              entrada para cPanel (Passenger)
src/                 servidor: rotas públicas, painel, rastreamento, métricas, banco
public/              página pública (CSS, JS, logos)
admin/               painel (HTML, CSS, JS — sem etapa de build)
scripts/             criar admin, consolidar dados, dados de demonstração
deploy/              Docker Compose + Caddy + backup para VPS
test/                testes automatizados
data/                banco embutido e arquivos locais (não versionar)
```
