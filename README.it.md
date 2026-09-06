<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="Uovo PokeTokenDocker">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>Trasforma l’utilizzo locale dell’AI per il coding in uno spazio Pokémon.</strong><br>
  Un servizio Docker local-first che trasforma i metadati di utilizzo in progressione, collezione e un companion web ordinato.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="Licenza MIT"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker pronto"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 o superiore"></a>
  <a href="https://ko-fi.com/marukoshi"><img src="https://img.shields.io/badge/Support%20on-Ko--fi-ff5e5b?logo=ko-fi&logoColor=white" alt="Supporta su Ko-fi"></a>
</p>

<p align="center" aria-label="Selettore lingua">
  <a href="README.md">🇬🇧 English</a>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">🇨🇳 简体中文</a>
  &nbsp;|&nbsp;
  <a href="README.it.md"><strong>🇮🇹 Italiano</strong></a>
  &nbsp;|&nbsp;
  <a href="README.ja.md">🇯🇵 日本語</a>
  &nbsp;|&nbsp;
  <a href="README.ko.md">🇰🇷 한국어</a>
  &nbsp;|&nbsp;
  <a href="README.es.md">🇪🇸 Español</a>
  &nbsp;|&nbsp;
  <a href="README.fr.md">🇫🇷 Français</a>
  &nbsp;|&nbsp;
  <a href="README.pt.md">🇵🇹 Português</a>
</p>

> **Pacchetto sorgente:** `0.1.1` · build Docker/web · il profilo Compose predefinito è `public-readonly`, locale e read-only.
>
> **Immagine pubblicata:** `ghcr.io/markussela/poketokendocker:0.1.1` · Imposta `PTD_IMAGE` per usare Docker Hub o un tag locale.

## Informazioni sul progetto

PokeTokenDocker è la build web headless del concetto originale del companion: l’utilizzo locale dell’AI per il coding diventa un uovo, poi un companion e infine un Pokédex in crescita. È pensato per un server, un NAS o una macchina locale fidata dove un container Docker può leggere i metadati di utilizzo e servire il companion dal browser.

Il confine dei dati è esplicito:

- Hermes e le directory dei provider sono montati **in sola lettura**;
- il companion scrive solo il proprio stato in `/data` quando abiliti esplicitamente un profilo mutante;
- il profilo predefinito `public-readonly` disabilita acquisti, modifiche alle impostazioni, import e altre mutazioni;
- non servono SSH, Tailscale, Home Assistant, database remoto o telemetria.

Questa repository contiene il companion Docker/web, non l’app tray Windows. Le due build condividono l’idea della progressione ma hanno runtime e configurazioni differenti.

## ✨ Funzionalità

- 🏠 **Workspace web completo:** Home, Borsa, Negozio, Pokédex, Registro catture e Impostazioni in una pagina responsive.
- 📈 **Progressione dall’utilizzo:** i metadati locali fanno avanzare l’uovo o il companion attivo, con fasi, rarità, natura e completamento.
- 📚 **Collezione:** il Pokédex registra le specie scoperte e il Registro catture conserva catene evolutive e cronologia.
- 🎒 **Ricompense:** Rare Candy, Mint, Shiny Charm, Poké Doll e livelli di uovo appartengono allo stato del companion, non all’account di un provider.
- 🔄 **Aggiornamenti live:** il browser riceve snapshot ed eventi di attività tramite SSE senza ricaricare tutta la pagina.
- 🧩 **Vista compatta:** [`web/mini.html`](web/mini.html) è adatta a Homepage o iframe fidati.
- 🌍 **Sette lingue UI:** inglese, italiano, coreano, giapponese, spagnolo, francese e portoghese.
- 🔒 **Avvio sicuro:** Compose usa loopback e `public-readonly`, salvo scelta esplicita di un altro profilo.

## 🔁 Come funziona la progressione

1. Il container legge i metadati supportati dai mount Hermes e provider read-only.
2. Il servizio locale normalizza token, costi, sessioni e totali per provider.
3. Il nuovo utilizzo fa avanzare l’uovo o la fase evolutiva corrente.
4. Schiusa, evoluzione, rarità, natura, shiny e collezione vengono salvati nello stato del companion.
5. La WebUI mostra lo snapshot e riceve gli aggiornamenti successivi tramite Server-Sent Events.

Lo stato di progressione appartiene a PokeTokenDocker. Non viene mai scritto in Hermes o nelle sorgenti dei provider.

## 🔌 Sorgenti locali supportate

I lettori integrati coprono attualmente:

- Claude Code
- Gemini
- Antigravity
- Codex
- OpenCode
- Cursor
- Grok
- GitHub Copilot
- Kiro
- Pi Agent
- utilizzo SQLite locale di Hermes Agent

Da Impostazioni puoi aggiungere directory JSON o JSONL per strumenti che salvano l’utilizzo in percorsi diversi. Le directory aggiuntive sono sempre scansionate in sola lettura.

Le quote ufficiali vengono mostrate solo quando una sorgente le fornisce. Se non sono disponibili, l’interfaccia lo indica senza inventare percentuali o orari di reset.

## 📸 Screenshot

La galleria combina otto schermate catturate dalla WebUI con una fixture sintetica isolata e una preview della card Homepage fornita dal progetto. Le schermate della fixture contengono soltanto valori dimostrativi; l’immagine di riferimento è stata rebrandizzata per questa release e non contiene host, account, credenziali o percorsi privati. L’indice completo è in [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md).

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="Workspace web PokeTokenDocker con Pikachu shiny e Pokémon nominati" width="520"></td><td><strong>🏠 Workspace.</strong><br>La vista larga riunisce Home, Borsa, Negozio e Pokédex con nomi leggibili. Pikachu shiny è il soggetto principale; Home mostra token e cinque provider dimostrativi.</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="Dashboard Homepage con una sola card Mini PokeTokenDocker e link pubblici" width="520"></td><td><strong>🧩 Mini su Homepage.</strong><br>Questa dashboard Homepage include header, ricerca, un gruppo Services con una sola service card (PokeTokenDocker) e un gruppo Bookmarks con quattro link pubblici. La Mini reale incorporata mostra Pikachu shiny, utilizzo sintetico di oggi, progressione e conteggio Pokédex; gli altri container sono esclusi per privacy.</td></tr>
  <tr><td align="center"><img src="docs/images/homepage.png" alt="Card Homepage PokeTokenDocker con Pikachu shiny e 8M oggi" width="520"></td><td><strong>🌐 Preview della card Homepage.</strong><br>La card compatta fornita per questa release usa l’identità PokeTokenDocker e mostra Pikachu shiny, natura Jolly, fase 1/1, progressione di un terzo e l’esempio visibile 8M today. Non contiene host, account, credenziali o percorsi privati.</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="Pannello Home PokeTokenDocker con Pikachu shiny e provider" width="420"></td><td><strong>📊 Home.</strong><br>Pikachu shiny, progressione, wallet, totali sintetici oggi/settimana, cinque provider, finestre quota dimostrative e avviso read-only in un unico pannello.</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="Borsa PokeTokenDocker con icone e conteggi" width="380"></td><td><strong>🎒 Borsa.</strong><br>La schermata separata mostra Rare Candy, Mint, Shiny Charm e Poké Doll con icone e quantità. Il confine read-only è visibile e nessuna azione modifica la fixture.</td></tr>
  <tr><td align="center"><img src="docs/images/shop.png" alt="Negozio PokeTokenDocker con prezzi sintetici" width="380"></td><td><strong>🛍️ Negozio.</strong><br>La schermata separata elenca oggetti di progressione e livelli di uovo con prezzi sintetici. Nel profilo `public-readonly` predefinito i controlli sono visibili ma disabilitati.</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="Pokédex PokeTokenDocker completo con sprite e nomi" width="520"></td><td><strong>📖 Pokédex.</strong><br>La collezione completa della fixture è visibile in un’unica cattura: 42 card, nomi Pokémon reali e sprite caricati, inclusa la linea evolutiva di Pikachu shiny. Nessun nome sconosciuto.</td></tr>
  <tr><td align="center"><img src="docs/images/catch-log.png" alt="Registro catture PokeTokenDocker con catene evolutive" width="520"></td><td><strong>📜 Registro catture.</strong><br>La schermata separata mostra catene evolutive, nomi leggibili, rarità, natura e date dimostrative neutrali.</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="Impostazioni PokeTokenDocker in sola lettura" width="520"></td><td><strong>⚙️ Impostazioni.</strong><br>Lingua, refresh, riepilogo, privacy, cartelle read-only, salvataggio, aggiornamenti e supporto sono raccolti in un dialogo. La schermata mostra il confine read-only predefinito.</td></tr>
</table>

## 🐳 Installazione con Docker Compose

Servono Docker Engine con Compose v2, una directory host contenente i dati Hermes leggibili dal container e una directory/volume per lo stato `/data`.

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

In PowerShell usa `Copy-Item docker/ptd.env.example .env`. Modifica `.env` e imposta `PTD_HERMES_DIR` sul percorso host dei dati Hermes; non committare `.env`.

Avvia il profilo predefinito usando l’immagine pubblicata:

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

Per costruire localmente, usa `docker compose -f docker/compose.yaml up -d --build`.

Controlla il servizio:

```shell
curl http://127.0.0.1:4317/healthz
```

Apri <http://127.0.0.1:4317/>. Il profilo usa `public-readonly`, esegue il bind su `127.0.0.1`, monta `/hermes:ro` e salva lo stato del companion in `/data`.

## 🛡️ Modalità runtime

| Modalità | Servizio Compose | Porta | Mutazioni | Uso |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | Disabilitate | Browser o Homepage read-only. |
| `docker-local` | profilo `local-integration` | `4318` | Abilitate esplicitamente | Test locali di acquisti, impostazioni e stato. |

Il profilo mutante è opt-in, usa loopback e un volume Docker dedicato:

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

Non esporre il profilo mutante a una LAN non fidata. Per test che cambiano inventario, progressione, impostazioni o wallet usa sempre fixture isolate.

## ⚙️ Configurazione

PokeTokenDocker usa il namespace `PTD_*`, diverso da quello `PTB_*` della build Windows.

| Variabile | Default | Scopo |
| --- | --- | --- |
| `PTD_IMAGE` | `ghcr.io/markussela/poketokendocker:0.1.1` | Riferimento all’immagine pubblicata; puoi sostituirlo con Docker Hub o un tag locale. |
| `PTD_HERMES_DIR` | obbligatoria | Directory host montata read-only in `/hermes`. |
| `PTD_DATA_DIR` | `../data` | Directory host montata in `/data`. |
| `PTD_BIND_HOST` | `127.0.0.1` | Interfaccia host del port mapping. |
| `PTD_ALLOWED_HOSTS` | host loopback | Host ammessi per le richieste mutanti. |
| `PTD_WEB_MODE` | `public-readonly` | Modalità del servizio. |
| `PTD_WEB_ALLOW_MUTATIONS` | `0` | Gate aggiuntivo per le azioni mutanti. |
| `PTD_EMBED_ORIGIN` | vuoto | Una sola origine autorizzata per iframe/Mini. |
| `PTD_WEB_PORT` | `4317` | Porta interna del container. |

`/hermes` e `/data` devono essere percorsi separati; il servizio rifiuta percorsi sovrapposti.

## 🔗 API HTTP

- `GET /healthz` — healthcheck del container;
- `GET /api/capabilities` — modalità e capacità;
- `GET /api/config` — link pubblici del progetto;
- `GET /api/snapshot` — snapshot sanitizzato;
- `GET /api/events` — eventi SSE;
- `POST /api/action` — azioni controllate dalle capability;
- `GET /mini.html` — vista compatta.

Le azioni mutanti richiedono JSON, controlli host/origine same-origin e capability abilitata. Il contratto snapshot rimuove percorsi privati, record grezzi, credenziali e stato non pertinente.

## 🔒 Privacy e confini dei dati

- mount Hermes/provider read-only;
- solo lo stato del companion in `/data`;
- nessuna mutazione nel profilo predefinito;
- nessun upload telemetry/analytics nel repository;
- non committare prompt, credenziali, API key, cookie, token, connection string, database, log o export;
- il controllo release è read-only e non richiede token GitHub;
- un export del companion è un dato personale e va trattato come backup.

Leggi [`SECURITY.md`](SECURITY.md) prima di esporre il servizio oltre loopback.

## 🧪 Build e verifica

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.1
docker build -f docker/Dockerfile --build-arg VERSION=0.1.1 -t poketokendocker:local .
```

Il container esegue come utente non privilegiato `node`, include solo dipendenze production ed espone un healthcheck su `/healthz`. Per contribuire usa [`CONTRIBUTING.md`](CONTRIBUTING.md) e dati sintetici.

## 🔗 Link

- [Repository](https://github.com/MarkusSela/PokeTokenDocker)
- [Container registry instructions](docs/CONTAINER-REGISTRIES.md)
- [Release](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [Segnala un problema](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Build companion Windows](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [Progetto PokeTokenBar originale](https://github.com/chattymin/PokeTokenBar)
- [Politica screenshot](docs/SCREENSHOTS.md)
- [Note sicurezza](SECURITY.md)

## 💛 Supporto

Se PokeTokenDocker ti è utile, puoi supportare la manutenzione su [Ko-fi](https://ko-fi.com/marukoshi). Il supporto non dà accesso ai dati e non modifica il confine di privacy locale.

## 🙏 Ringraziamenti

Grazie al progetto originale [PokeTokenBar](https://github.com/chattymin/PokeTokenBar) per il concetto del companion e il ciclo di progressione.

Il progetto usa anche [Docker](https://www.docker.com/), [Node.js](https://nodejs.org/), [sql.js](https://github.com/sql-js/sql.js), [PokéAPI](https://pokeapi.co/) e gli sprite del repository [PokeAPI/sprites](https://github.com/PokeAPI/sprites).

## 📄 Licenza

Il codice è distribuito con [licenza MIT](LICENSE). La licenza vale per il codice del progetto e non concede diritti su marchi, artwork o dati di terze parti.

PokeTokenDocker è un fan project non ufficiale e non commerciale. Non è affiliato, approvato o sponsorizzato da Nintendo, Game Freak, Creatures Inc. o The Pokémon Company. Il servizio è fornito “così com’è”, senza garanzie.
