<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="Ovo PokeTokenDocker">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>Transforme o uso local de IA para programação em um espaço Pokémon.</strong><br>
  Um serviço Docker local-first que transforma metadados de uso em progresso, coleção e um companheiro web.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="Licença MIT"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker pronto"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 ou superior"></a>
</p>

<p align="center" aria-label="Seletor de idioma">
  <a href="README.md">🇬🇧 English</a>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">🇨🇳 简体中文</a>
  &nbsp;|&nbsp;
  <a href="README.it.md">🇮🇹 Italiano</a>
  &nbsp;|&nbsp;
  <a href="README.ja.md">🇯🇵 日本語</a>
  &nbsp;|&nbsp;
  <a href="README.ko.md">🇰🇷 한국어</a>
  &nbsp;|&nbsp;
  <a href="README.es.md">🇪🇸 Español</a>
  &nbsp;|&nbsp;
  <a href="README.fr.md">🇫🇷 Français</a>
  &nbsp;|&nbsp;
  <a href="README.pt.md"><strong>🇵🇹 Português</strong></a>
</p>

> **Pacote-fonte:** `0.1.0` · build Docker/web · o perfil Compose padrão é `public-readonly`, local e somente leitura.
>
> **Imagem publicada:** `ghcr.io/markussela/poketokendocker:0.1.0` · Defina `PTD_IMAGE` para usar Docker Hub ou uma tag local.

## Sobre o projeto

PokeTokenDocker é a versão web headless da ideia PokeTokenBar: o uso local de IA para programação vira um ovo, depois um companheiro e finalmente uma Pokédex em crescimento. Foi criado para servidor, NAS ou máquina local confiável onde um contêiner Docker possa ler metadados de uso e servir o companheiro pelo navegador.

Os diretórios Hermes e dos provedores são montados em **somente leitura**. O companheiro grava seu próprio estado em `/data` apenas quando um perfil local mutável é habilitado explicitamente. O perfil padrão `public-readonly` desativa compras, alterações de configuração, importações e outras mutações.

## ✨ Recursos

- 🏠 **Área web:** Home, Bag, Shop, Pokédex, Catch Log e Settings em uma página responsiva.
- 📈 **Progresso pelo uso:** metadados locais avançam o ovo ou companheiro e registram estágios, raridade, natureza e graduação.
- 📚 **Coleção:** a Pokédex guarda espécies descobertas e o Catch Log guarda cadeias evolutivas e histórico.
- 🎒 **Recompensas:** Rare Candy, Mint, Shiny Charm, Poké Doll e níveis de ovo pertencem ao estado do companheiro.
- 🔄 **Atualização ao vivo:** snapshots e eventos SSE chegam sem recarregar a página inteira.
- 🧩 **Visão Mini:** [`web/mini.html`](web/mini.html) serve para Homepage ou iframe confiável.
- 🌍 **Sete idiomas:** inglês, italiano, coreano, japonês, espanhol, francês e português.
- 🔒 **Inicialização segura:** Compose usa loopback e `public-readonly` por padrão.

## 🔌 Fontes locais

Os leitores integrados cobrem Claude Code, Gemini, Antigravity, Codex, OpenCode, Cursor, Grok, GitHub Copilot, Kiro, Pi Agent e o uso local SQLite do Hermes Agent. Pastas JSON/JSONL podem ser adicionadas em Settings; a leitura adicional continua somente leitura.

Limites oficiais aparecem apenas quando uma fonte os fornece. Quando não estão disponíveis, a interface informa isso sem inventar percentuais ou horários.

## 📸 Capturas de tela

As imagens foram capturadas de uma fixture sintética isolada. Contêm apenas valores de demonstração e não representam o contêiner live ou uma conta pessoal. Veja [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md).

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="Área web PokeTokenDocker" width="520"></td><td><strong>🏠 Área de trabalho.</strong><br>Home, Bag, Shop e Pokédex no layout amplo.</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="Home PokeTokenDocker" width="360"></td><td><strong>📊 Home.</strong><br>Companheiro, progresso, wallet, uso, provedores, limites e aviso read-only.</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="Bag PokeTokenDocker" width="190"><img src="docs/images/shop.png" alt="Shop PokeTokenDocker" width="190"></td><td><strong>🎒 Bag e 🛍️ Shop.</strong><br>Inventário, itens e preços de demonstração; no perfil padrão as ações ficam desativadas.</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="Pokédex PokeTokenDocker" width="230"><img src="docs/images/catch-log.png" alt="Catch Log PokeTokenDocker" width="230"></td><td><strong>📖 Pokédex e Catch Log.</strong><br>Sprites animados, cadeias evolutivas, raridade, natureza e datas neutras.</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="Settings PokeTokenDocker" width="520"></td><td><strong>⚙️ Settings.</strong><br>Idioma, atualização, privacidade, pastas read-only, backup, versões e suporte.</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="Visão Mini PokeTokenDocker" width="520"></td><td><strong>🧩 Visão Mini.</strong><br>Para Homepage ou iframe confiável; `PTD_EMBED_ORIGIN` autoriza uma única origem.</td></tr>
</table>

## 🐳 Instalação com Docker Compose

Você precisa do Docker Engine com Compose v2, de um diretório Hermes legível pelo contêiner e de um diretório/volume para `/data`.

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

Edite `.env`, defina `PTD_HERMES_DIR` como o caminho do host Docker que contém os dados Hermes e não envie `.env` ao repositório. Baixe a imagem publicada e inicie o perfil padrão:

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

Para compilar localmente, use `docker compose -f docker/compose.yaml up -d --build`. Verifique o serviço:

```shell
curl http://127.0.0.1:4317/healthz
```

Abra <http://127.0.0.1:4317/>. O perfil padrão usa `public-readonly`, publica em `127.0.0.1`, monta `/hermes:ro` e salva o estado do companheiro em `/data`.

## 🛡️ Modos de execução

| Modo | Serviço Compose | Porta | Mutações | Uso |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | Desativadas | Navegador ou Homepage somente leitura. |
| `docker-local` | perfil `local-integration` | `4318` | Ativadas explicitamente | Testes locais de compras, configurações e estado. |

O perfil mutável é opt-in, usa loopback e um volume Docker separado:

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

Não exponha o perfil mutável a uma LAN não confiável. Para testes que alterem inventário, progresso, configurações ou wallet, use fixtures isoladas.

## ⚙️ Configuração

As variáveis usam o namespace `PTD_*`, diferente do `PTB_*` do Windows: `PTD_IMAGE` aponta para a imagem publicada `ghcr.io/markussela/poketokendocker:0.1.0` e pode ser trocada por Docker Hub ou uma tag local; `PTD_HERMES_DIR` é obrigatório; `PTD_DATA_DIR` define `/data`; `PTD_BIND_HOST` controla o bind; `PTD_ALLOWED_HOSTS` limita requisições mutáveis; `PTD_WEB_MODE` e `PTD_WEB_ALLOW_MUTATIONS` mantêm o modo seguro; `PTD_EMBED_ORIGIN` autoriza uma origem para iframe; `PTD_WEB_PORT` é a porta interna `4317`.

`/hermes` e `/data` devem ser caminhos separados. Caminhos sobrepostos são recusados.

## 🔗 API e privacidade

O serviço oferece `/healthz`, `/api/capabilities`, `/api/config`, `/api/snapshot`, `/api/events`, `POST /api/action` e `/mini.html`. Ações mutáveis exigem JSON, validação same-origin e capability ativa.

Hermes e provedores são read-only; somente o estado do companheiro vai para `/data`. Não faça commit de prompts, credenciais, API keys, cookies, tokens, connection strings, bancos, logs ou saves exportados. Leia [`SECURITY.md`](SECURITY.md) antes de sair do loopback.

## 🧪 Build e verificação

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.0
docker build -f docker/Dockerfile --build-arg VERSION=0.1.0 -t poketokendocker:local .
```

A imagem usa o usuário sem privilégios `node` e healthcheck em `/healthz`. Para contribuir, consulte [`CONTRIBUTING.md`](CONTRIBUTING.md) e use dados sintéticos.

## 🔗 Links e licença

- [Repositório](https://github.com/MarkusSela/PokeTokenDocker)
- [Instruções dos registros de contêiner](docs/CONTAINER-REGISTRIES.md)
- [Releases](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [Relatar problema](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Versão Windows](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [Projeto PokeTokenBar original](https://github.com/chattymin/PokeTokenBar)
- [Política de capturas](docs/SCREENSHOTS.md)
- [Notas de segurança](SECURITY.md)

Se for útil, apoie a manutenção em [Ko-fi](https://ko-fi.com/marukoshi). O código usa a [licença MIT](LICENSE). PokeTokenDocker é um fan project não oficial e não comercial, sem afiliação com Nintendo, Game Freak, Creatures Inc. ou The Pokémon Company.
