<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="PokeTokenDocker 蛋">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>把本地 AI 编程使用量变成宝可梦工作区。</strong><br>
  一个 local-first Docker 服务，将使用元数据转化为成长、收集和专注的 Web 伴侣。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT 许可证"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="支持 Docker"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 或更高"></a>
</p>

<p align="center" aria-label="语言选择">
  <a href="README.md">🇬🇧 English</a>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md"><strong>🇨🇳 简体中文</strong></a>
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
  <a href="README.pt.md">🇵🇹 Português</a>
</p>

> **源代码包：** `0.1.1` · Docker/Web 版本 · 默认 Compose 配置为本地 `public-readonly` 只读模式。
>
> **已发布镜像：** `ghcr.io/markussela/poketokendocker:0.1.1` · 设置 `PTD_IMAGE` 可改用 Docker Hub 或本地标签。

## 项目简介

PokeTokenDocker 是原始 companion 概念的无头 Web 版本：本地 AI 编程使用量会变成蛋、伙伴，最终形成不断成长的宝可梦图鉴。它适合服务器、NAS 或可信本地机器，让 Docker 容器读取使用元数据并通过浏览器提供伙伴界面。

数据边界保持清晰：Hermes 和 provider 目录以只读方式挂载；只有明确启用可变本地配置时，伙伴才会把自己的状态写入 `/data`；默认的 `public-readonly` 配置会禁用购买、设置写入、导入和其他修改；不需要 SSH、Tailscale、Home Assistant、远程数据库或遥测服务。

本仓库是 Docker/Web 版本，不是 Windows 托盘应用。两者共享成长概念，但运行时和配置名称不同。

## ✨ 功能

- 🏠 **Web 工作区：** Home、Bag、Shop、Pokédex、Catch Log 和 Settings 位于同一个响应式页面。
- 📈 **使用量成长：** 本地元数据会推进当前蛋或伙伴，并记录阶段、稀有度、性格和毕业状态。
- 📚 **收藏图鉴：** Pokédex 记录发现的物种，Catch Log 保存每条进化链和捕获历史。
- 🎒 **奖励循环：** Rare Candy、Mint、Shiny Charm、Poké Doll 和蛋等级属于伙伴状态，而不是 provider 账户。
- 🔄 **实时更新：** 浏览器通过 SSE 接收 snapshot 和 activity 事件，无需完整刷新页面。
- 🧩 **Mini 视图：** [`web/mini.html`](web/mini.html) 可用于可信的 Homepage 或 iframe。
- 🌍 **七种界面语言：** 英语、意大利语、韩语、日语、西班牙语、法语和葡萄牙语。
- 🔒 **安全启动：** Compose 默认绑定 loopback 并运行在 `public-readonly` 模式。

## 🔁 成长流程

1. 容器从只读的 Hermes/provider 挂载读取支持的使用元数据。
2. 本地服务统一 token、费用、会话和 provider 统计。
3. 新使用量推进当前蛋或进化阶段。
4. 孵化、进化、稀有度、性格、闪光和收藏状态保存在伙伴状态中。
5. WebUI 显示 snapshot，并通过 Server-Sent Events 接收后续变化。

成长状态属于 PokeTokenDocker，不会写回 Hermes 或 provider 源文件。

## 🔌 支持的本地来源

内置读取器包括 Claude Code、Gemini、Antigravity、Codex、OpenCode、Cursor、Grok、GitHub Copilot、Kiro、Pi Agent，以及 Hermes Agent 本地 SQLite 使用量。还可以在 Settings 中添加 JSON/JSONL 文件夹；额外扫描始终为只读。

只有来源提供官方配额时才会显示配额窗口；不可用时界面会明确说明，不会虚构百分比或重置时间。

## 📸 截图

截图画廊由隔离合成 fixture 的 8 张截图和项目提供的 Homepage 卡片参考图组成。fixture 截图只包含演示值；参考图已在本版本中完成品牌替换，不包含主机、账户、凭据或私人路径。完整政策和索引见 [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md)。

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="带有 shiny Pikachu 和已命名 Pokémon 的 PokeTokenDocker Web 工作区" width="520"></td><td><strong>🏠 工作区。</strong><br>宽屏布局同时展示 Home、Bag、Shop 和带有可读名称的 Pokédex。shiny Pikachu 是视觉主角，Home 显示合成 token 数值和 5 个演示 provider。</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="带有一个 PokeTokenDocker Mini 服务卡片和公开链接的 Homepage 仪表盘" width="520"></td><td><strong>🧩 Homepage 中的 Mini。</strong><br>这个 Homepage 仪表盘包含页眉、搜索、仅有一个 PokeTokenDocker service card 的 Services 分组，以及包含四个公开链接的 Bookmarks 分组。嵌入的真实 Mini 显示 shiny Pikachu、合成的今日使用量、进度和 Pokédex 数量；其他容器因隐私不会显示。</td></tr>
  <tr><td align="center"><img src="docs/images/homepage.png" alt="显示 shiny Pikachu 和 8M today 的 PokeTokenDocker Homepage 卡片" width="520"></td><td><strong>🌐 Homepage 卡片预览。</strong><br>本版本提供的紧凑卡片使用 PokeTokenDocker 标识，显示 shiny Pikachu、Jolly 性格、1/1 阶段、三分之一进度和可见的 8M today 示例。它不包含主机、账户、凭据或私人路径。</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="带有 shiny Pikachu 和 provider 指标的 PokeTokenDocker Home" width="420"></td><td><strong>📊 Home。</strong><br>在一个面板中显示 shiny Pikachu、进度、wallet、合成的今日/本周总量、5 个 provider、演示配额窗口和只读提示。</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="带有图标和数量的 PokeTokenDocker Bag" width="380"></td><td><strong>🎒 Bag。</strong><br>独立 Bag 截图显示 Rare Candy、Mint、Shiny Charm 和 Poké Doll 的图标与数量，并显示只读边界。</td></tr>
  <tr><td align="center"><img src="docs/images/shop.png" alt="带有合成价格的 PokeTokenDocker Shop" width="380"></td><td><strong>🛍️ Shop。</strong><br>独立 Shop 截图列出成长道具和 egg tier，并使用合成价格。默认 `public-readonly` 配置下控件可见但已禁用。</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="带有 Pokémon 名称和 sprite 的完整 PokeTokenDocker Pokédex" width="520"></td><td><strong>📖 Pokédex。</strong><br>一张截图展示完整 fixture 集合：42 张卡片、真实 Pokémon 名称和已加载的 sprite，包括 shiny Pikachu 的进化线。没有未知名称。</td></tr>
  <tr><td align="center"><img src="docs/images/catch-log.png" alt="带有进化链的 PokeTokenDocker Catch Log" width="520"></td><td><strong>📜 Catch Log。</strong><br>独立日志显示进化链、可读名称、稀有度、性格和中性的演示日期。</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="只读模式下的 PokeTokenDocker Settings" width="520"></td><td><strong>⚙️ Settings。</strong><br>语言、刷新、摘要、隐私、只读文件夹、保存、更新和支持链接集中在一个对话框中。</td></tr>
</table>

## 🐳 使用 Docker Compose 安装

需要 Docker Engine、Compose v2、一个可读的 Hermes 数据目录，以及用于 `/data` 的主机目录或 Docker volume。

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

编辑 `.env`，把 `PTD_HERMES_DIR` 改为 Docker 主机上的 Hermes 数据路径；不要提交 `.env`。然后拉取已发布镜像并启动默认配置：

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

如需本地构建，请使用 `docker compose -f docker/compose.yaml up -d --build`。然后检查服务：

```shell
curl http://127.0.0.1:4317/healthz
```

打开 <http://127.0.0.1:4317/>。默认配置使用 `public-readonly`、绑定 `127.0.0.1`、以只读方式挂载 `/hermes`，并将伙伴状态放在 `/data`。

## 🛡️ 运行模式

| 模式 | Compose 服务 | 端口 | 修改操作 | 用途 |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | 禁用 | 安全的浏览器或只读 Homepage。 |
| `docker-local` | `local-integration` profile | `4318` | 明确启用 | 本地测试购买、设置和状态写入。 |

可变 profile 是 opt-in，只绑定 loopback，并使用独立 Docker volume：

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

不要把可变 profile 暴露给不可信 LAN。涉及库存、成长、设置或 wallet 的测试必须使用隔离 fixture。

## ⚙️ 配置

Docker 版本使用 `PTD_*` 命名空间，与 Windows 版本的 `PTB_*` 不兼容。

| 变量 | 默认值 | 作用 |
| --- | --- | --- |
| `PTD_IMAGE` | `ghcr.io/markussela/poketokendocker:0.1.1` | 已发布镜像；可改为 Docker Hub 或本地标签。 |
| `PTD_HERMES_DIR` | 必填 | 以只读方式挂载到 `/hermes` 的主机目录。 |
| `PTD_DATA_DIR` | `../data` | 挂载到 `/data` 的主机目录。 |
| `PTD_BIND_HOST` | `127.0.0.1` | 端口发布使用的主机接口。 |
| `PTD_ALLOWED_HOSTS` | loopback hosts | 可变 API 请求允许的 Host。 |
| `PTD_WEB_MODE` | `public-readonly` | 服务模式。 |
| `PTD_WEB_ALLOW_MUTATIONS` | `0` | 修改操作的额外开关。 |
| `PTD_EMBED_ORIGIN` | 空 | Mini iframe 允许的单一来源。 |
| `PTD_WEB_PORT` | `4317` | 容器内部端口。 |

`/hermes` 与 `/data` 必须是分离路径；服务会拒绝重叠路径。

## 🔗 HTTP 接口

- `GET /healthz` — 容器健康检查；
- `GET /api/capabilities` — 模式和能力；
- `GET /api/config` — 项目公开链接；
- `GET /api/snapshot` — 清理后的伙伴快照；
- `GET /api/events` — SSE 事件；
- `POST /api/action` — 经过 capability 检查的浏览器操作；
- `GET /mini.html` — 紧凑视图。

修改请求要求 JSON、同源 Host/Origin 检查和启用的 capability。快照契约会移除私有路径、原始 provider 记录、凭据和无关状态。

## 🔒 隐私与数据边界

Hermes/provider 为只读挂载；只有伙伴状态写入 `/data`；默认模式没有修改操作；仓库不包含遥测上传。不要提交 prompt、凭据、API key、cookie、token、连接字符串、数据库、日志或导出的 save。更新检查为只读且不需要 GitHub token。导出的伙伴 save 属于个人数据，应当按备份处理。

阅读 [`SECURITY.md`](SECURITY.md) 后再把服务暴露到 loopback 之外。

## 🧪 构建与验证

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.1
docker build -f docker/Dockerfile --build-arg VERSION=0.1.1 -t poketokendocker:local .
```

镜像以非特权 `node` 用户运行，只安装 production 依赖，并包含 `/healthz` 健康检查。贡献时请阅读 [`CONTRIBUTING.md`](CONTRIBUTING.md) 并使用合成数据。

## 🔗 链接

- [项目仓库](https://github.com/MarkusSela/PokeTokenDocker)
- [容器仓库说明](docs/CONTAINER-REGISTRIES.md)
- [Releases](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [提交问题](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Windows companion](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [原始 PokeTokenBar 项目](https://github.com/chattymin/PokeTokenBar)
- [截图策略](docs/SCREENSHOTS.md)
- [安全说明](SECURITY.md)

## 💛 支持

如果 PokeTokenDocker 对你有帮助，可以在 [Ko-fi](https://ko-fi.com/marukoshi) 支持维护。支持不会提供数据访问，也不会改变本地隐私边界。

## 🙏 致谢

感谢原始 [PokeTokenBar](https://github.com/chattymin/PokeTokenBar) 项目提供 companion 概念和成长循环。项目还使用了 Docker、Node.js、sql.js、PokéAPI 及 PokeAPI/sprites。

## 📄 许可证

源代码使用 [MIT 许可证](LICENSE)。许可证仅适用于本项目源代码，不授予第三方商标、艺术作品或数据的权利。

PokeTokenDocker 是非官方、非商业 fan project，与 Nintendo、Game Freak、Creatures Inc. 或 The Pokémon Company 无关联、无认可、无赞助。服务按“现状”提供，不作任何保证。
