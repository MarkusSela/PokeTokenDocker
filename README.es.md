<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="Huevo de PokeTokenDocker">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>Convierte el uso local de IA para programar en un espacio Pokémon.</strong><br>
  Un servicio Docker local-first que transforma metadatos de uso en progreso, colección y un compañero web.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="Licencia MIT"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker listo"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 o superior"></a>
</p>

<p align="center" aria-label="Selector de idioma">
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
  <a href="README.es.md"><strong>🇪🇸 Español</strong></a>
  &nbsp;|&nbsp;
  <a href="README.fr.md">🇫🇷 Français</a>
  &nbsp;|&nbsp;
  <a href="README.pt.md">🇵🇹 Português</a>
</p>

> **Paquete fuente:** `0.1.0` · build Docker/web · el perfil Compose predeterminado es `public-readonly`, local y de solo lectura.
>
> **Imagen publicada:** `ghcr.io/markussela/poketokendocker:0.1.0` · Define `PTD_IMAGE` para usar Docker Hub o una etiqueta local.

## Sobre el proyecto

PokeTokenDocker es la versión web headless de la idea PokeTokenBar: el uso local de IA para programar se convierte en un huevo, después en un compañero y finalmente en una Pokédex que crece. Está pensado para un servidor, NAS o máquina local de confianza donde un contenedor Docker pueda leer metadatos de uso y servir el compañero desde el navegador.

Hermes y los directorios de los proveedores se montan en **solo lectura**. El compañero solo escribe su propio estado en `/data` cuando se activa explícitamente un perfil local con mutaciones. El perfil predeterminado `public-readonly` deshabilita compras, cambios de configuración, importaciones y otras mutaciones.

## ✨ Funciones

- 🏠 **Espacio web:** Home, Bag, Shop, Pokédex, Catch Log y Settings en una página responsive.
- 📈 **Progreso basado en uso:** los metadatos locales avanzan el huevo o compañero y guardan etapas, rareza, naturaleza y graduación.
- 📚 **Colección:** Pokédex registra especies descubiertas y Catch Log conserva cadenas evolutivas e historial.
- 🎒 **Recompensas:** Rare Candy, Mint, Shiny Charm, Poké Doll y niveles de huevo pertenecen al estado del compañero.
- 🔄 **Actualizaciones en vivo:** SSE entrega snapshots y eventos sin recargar toda la página.
- 🧩 **Vista Mini:** [`web/mini.html`](web/mini.html) sirve para Homepage o iframe de confianza.
- 🌍 **Siete idiomas:** inglés, italiano, coreano, japonés, español, francés y portugués.
- 🔒 **Inicio seguro:** Compose usa loopback y `public-readonly` por defecto.

## 🔌 Fuentes locales

Los lectores integrados cubren Claude Code, Gemini, Antigravity, Codex, OpenCode, Cursor, Grok, GitHub Copilot, Kiro, Pi Agent y el uso local de Hermes Agent en SQLite. Desde Settings se pueden añadir carpetas JSON/JSONL; el escaneo adicional siempre es de solo lectura.

Las cuotas oficiales solo aparecen cuando una fuente las proporciona. Si no están disponibles, la interfaz lo indica sin inventar porcentajes ni horas de reinicio.

## 📸 Capturas

Las imágenes se capturaron con una fixture sintética aislada. Solo contienen valores de demostración y no representan el contenedor live ni una cuenta personal. Consulta [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md).

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="Espacio web PokeTokenDocker con Pikachu shiny y Pokémon con nombre" width="520"></td><td><strong>🏠 Espacio.</strong><br>La vista ancha reúne Home, Bag, Shop y una Pokédex con nombres legibles. Pikachu shiny es el protagonista y Home muestra valores sintéticos de tokens y cinco proveedores de demostración.</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="Panel de Homepage con una tarjeta PokeTokenDocker Mini y enlaces públicos" width="520"></td><td><strong>🧩 Mini en Homepage.</strong><br>Este panel de Homepage incluye encabezado, búsqueda, un grupo Services con una única tarjeta de servicio (PokeTokenDocker) y un grupo Bookmarks con cuatro enlaces públicos. La Mini real incrustada muestra Pikachu shiny, uso sintético de hoy, progreso y cantidad de Pokédex; los demás contenedores no aparecen por privacidad.</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="Panel Home de PokeTokenDocker con Pikachu shiny y proveedores" width="420"></td><td><strong>📊 Home.</strong><br>Pikachu shiny, progreso, wallet, totales sintéticos de hoy/semana, cinco proveedores, cuotas de demostración y aviso de solo lectura en un panel.</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="Bag de PokeTokenDocker con iconos y cantidades" width="380"></td><td><strong>🎒 Bag.</strong><br>La vista independiente muestra Rare Candy, Mint, Shiny Charm y Poké Doll con iconos y cantidades. El límite de solo lectura está visible.</td></tr>
  <tr><td align="center"><img src="docs/images/shop.png" alt="Shop de PokeTokenDocker con precios sintéticos" width="380"></td><td><strong>🛍️ Shop.</strong><br>La vista independiente lista objetos de progreso y niveles de huevo con precios sintéticos. En el perfil `public-readonly` los controles están visibles pero desactivados.</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="Pokédex completa de PokeTokenDocker con sprites y nombres" width="520"></td><td><strong>📖 Pokédex.</strong><br>La colección completa de la fixture aparece en una sola captura: 42 tarjetas, nombres reales y sprites cargados, incluida la línea evolutiva de Pikachu shiny. No hay nombres desconocidos.</td></tr>
  <tr><td align="center"><img src="docs/images/catch-log.png" alt="Catch Log de PokeTokenDocker con cadenas evolutivas" width="520"></td><td><strong>📜 Catch Log.</strong><br>El registro independiente muestra cadenas evolutivas, nombres legibles, rareza, naturaleza y fechas neutras de demostración.</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="Settings de PokeTokenDocker en modo de solo lectura" width="520"></td><td><strong>⚙️ Settings.</strong><br>Idioma, actualización, resumen, privacidad, carpetas read-only, guardado, actualizaciones y soporte en un diálogo. Se muestra el límite read-only predeterminado.</td></tr>
</table>

## 🐳 Instalación con Docker Compose

Necesitas Docker Engine con Compose v2, un directorio Hermes legible por el contenedor y un directorio/volume para `/data`.

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

Edita `.env`, define `PTD_HERMES_DIR` con la ruta del host Docker que contiene los datos Hermes y no subas `.env` al repositorio. Descarga la imagen publicada y arranca el perfil predeterminado:

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

Para construir localmente, usa `docker compose -f docker/compose.yaml up -d --build`. Comprueba el servicio:

```shell
curl http://127.0.0.1:4317/healthz
```

Abre <http://127.0.0.1:4317/>. El perfil predeterminado usa `public-readonly`, publica en `127.0.0.1`, monta `/hermes:ro` y guarda el estado del compañero en `/data`.

## 🛡️ Modos de ejecución

| Modo | Servicio Compose | Puerto | Mutaciones | Uso |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | Desactivadas | Navegador o Homepage de solo lectura. |
| `docker-local` | perfil `local-integration` | `4318` | Activadas explícitamente | Pruebas locales de compras, settings y estado. |

El perfil mutante es opt-in, usa loopback y un volume Docker separado:

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

No expongas el perfil mutante a una LAN no confiable. Para pruebas que cambien inventario, progreso, settings o wallet usa fixtures aisladas.

## ⚙️ Configuración

Las variables usan el namespace `PTD_*`, distinto del `PTB_*` de Windows: `PTD_IMAGE` apunta a la imagen publicada `ghcr.io/markussela/poketokendocker:0.1.0` y puede cambiarse por Docker Hub o una etiqueta local; `PTD_HERMES_DIR` es obligatorio; `PTD_DATA_DIR` define `/data`; `PTD_BIND_HOST` controla el bind (por defecto `127.0.0.1`); `PTD_ALLOWED_HOSTS` limita las peticiones mutantes; `PTD_WEB_MODE` y `PTD_WEB_ALLOW_MUTATIONS` mantienen el modo seguro; `PTD_EMBED_ORIGIN` autoriza una única integración iframe; `PTD_WEB_PORT` es el puerto interno `4317`.

`/hermes` y `/data` deben ser rutas separadas. El servicio rechaza rutas solapadas.

## 🔗 API y privacidad

Se ofrecen `GET /healthz`, `/api/capabilities`, `/api/config`, `/api/snapshot`, `/api/events`, `POST /api/action` y `/mini.html`. Las acciones mutantes necesitan JSON, validación same-origin y una capability activa.

Hermes/provider son read-only y solo el estado del compañero va a `/data`. No subas prompts, credenciales, API keys, cookies, tokens, connection strings, bases de datos, logs ni saves exportados. Lee [`SECURITY.md`](SECURITY.md) antes de salir de loopback.

## 🧪 Build y verificación

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.0
docker build -f docker/Dockerfile --build-arg VERSION=0.1.0 -t poketokendocker:local .
```

La imagen usa el usuario sin privilegios `node` y un healthcheck en `/healthz`. Para contribuir, consulta [`CONTRIBUTING.md`](CONTRIBUTING.md) y usa datos sintéticos.

## 🔗 Enlaces y licencia

- [Repositorio](https://github.com/MarkusSela/PokeTokenDocker)
- [Instrucciones de registros de contenedores](docs/CONTAINER-REGISTRIES.md)
- [Releases](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [Reportar un problema](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Versión Windows](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [Proyecto original PokeTokenBar](https://github.com/chattymin/PokeTokenBar)
- [Política de capturas](docs/SCREENSHOTS.md)
- [Notas de seguridad](SECURITY.md)

Si te resulta útil, puedes apoyar el mantenimiento en [Ko-fi](https://ko-fi.com/marukoshi). El código se distribuye bajo la [licencia MIT](LICENSE). PokeTokenDocker es un fan project no oficial y no comercial, no afiliado ni respaldado por Nintendo, Game Freak, Creatures Inc. o The Pokémon Company.
