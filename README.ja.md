<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="PokeTokenDocker のタマゴ">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>ローカル AI コーディング利用量を Pokémon ワークスペースに変える。</strong><br>
  利用メタデータを成長、コレクション、集中できる Web コンパニオンに変換する local-first Docker サービスです。
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT ライセンス"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker 対応"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 以上"></a>
</p>

<p align="center" aria-label="言語セレクター">
  <a href="README.md">🇬🇧 English</a>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">🇨🇳 简体中文</a>
  &nbsp;|&nbsp;
  <a href="README.it.md">🇮🇹 Italiano</a>
  &nbsp;|&nbsp;
  <a href="README.ja.md"><strong>🇯🇵 日本語</strong></a>
  &nbsp;|&nbsp;
  <a href="README.ko.md">🇰🇷 한국어</a>
  &nbsp;|&nbsp;
  <a href="README.es.md">🇪🇸 Español</a>
  &nbsp;|&nbsp;
  <a href="README.fr.md">🇫🇷 Français</a>
  &nbsp;|&nbsp;
  <a href="README.pt.md">🇵🇹 Português</a>
</p>

> **ソースパッケージ:** `0.1.0` · Docker/Web ビルド · 既定の Compose プロファイルは `public-readonly` のローカル・読み取り専用です。
>
> **公開済みイメージ:** `ghcr.io/markussela/poketokendocker:0.1.0` · `PTD_IMAGE` で Docker Hub またはローカルタグに変更できます。

## プロジェクトについて

PokeTokenDocker は PokeTokenBar のアイデアをヘッドレス Web 化したものです。ローカル AI コーディングの利用量がタマゴ、コンパニオン、成長する Pokédex になります。Docker コンテナが利用メタデータを読み取り、ブラウザからコンパニオンを表示できるサーバー、NAS、信頼できるローカル環境向けに設計されています。

データ境界は明確です。Hermes とプロバイダーのディレクトリは読み取り専用でマウントされます。明示的にローカルの変更プロファイルを有効にした場合だけ、コンパニオン自身の状態を `/data` に書き込みます。既定の `public-readonly` は購入、設定変更、インポートなどを無効にします。SSH、Tailscale、Home Assistant、リモートデータベース、テレメトリーは必要ありません。

このリポジトリは Docker/Web 版です。Windows のトレイアプリとはランタイムと設定が異なります。

## ✨ 主な機能

- 🏠 **Web ワークスペース:** Home、Bag、Shop、Pokédex、Catch Log、Settings。
- 📈 **利用量から成長:** ローカルメタデータでタマゴやコンパニオンを進め、段階、レア度、性格、卒業を記録。
- 📚 **コレクション:** Pokédex に発見種を、Catch Log に進化チェーンと履歴を保存。
- 🎒 **報酬ループ:** Rare Candy、Mint、Shiny Charm、Poké Doll、タマゴ段階をコンパニオン状態として管理。
- 🔄 **ライブ更新:** SSE で snapshot と activity を受け取り、ページ全体を再読み込みせず更新。
- 🧩 **Mini ビュー:** [`web/mini.html`](web/mini.html) は信頼できる Homepage/iframe 向け。
- 🌍 **7 言語:** 英語、イタリア語、韓国語、日本語、スペイン語、フランス語、ポルトガル語。
- 🔒 **安全な既定値:** Compose は loopback と `public-readonly` で開始。

## 🔁 成長の流れ

1. コンテナが読み取り専用の Hermes/provider mount から利用メタデータを読み取ります。
2. ローカルサービスが token、コスト、セッション、provider の集計を正規化します。
3. 新しい利用量でタマゴまたは進化段階が進みます。
4. 孵化、進化、レア度、性格、色違い、コレクション状態をコンパニオン状態に保存します。
5. WebUI が snapshot を表示し、Server-Sent Events で後続更新を受け取ります。

状態を Hermes や provider のソースへ書き戻すことはありません。

## 🔌 対応するローカルソース

組み込みリーダーは Claude Code、Gemini、Antigravity、Codex、OpenCode、Cursor、Grok、GitHub Copilot、Kiro、Pi Agent、Hermes Agent のローカル SQLite 利用量に対応します。Settings から JSON/JSONL フォルダーを追加できます。追加スキャンも読み取り専用です。

公式の quota はソースが提供した場合だけ表示し、利用できない場合は値を推測しません。

## 📸 スクリーンショット

画像は隔離した合成 fixture から取得しています。live コンテナや個人アカウントのデータではありません。完全な一覧とルールは [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md) を参照してください。

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="Pikachu shiny と名前付き Pokémon を表示する PokeTokenDocker Web ワークスペース" width="520"></td><td><strong>🏠 ワークスペース。</strong><br>ワイド表示で Home、Bag、Shop、Pokédex を確認できます。主役は Pikachu shiny。Home には合成 token 値と 5 つのデモ provider が表示されます。</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="PokeTokenDocker Mini と公開リンク 1 枚だけを載せた Homepage ダッシュボード" width="520"></td><td><strong>🧩 Homepage の Mini。</strong><br>この Homepage ダッシュボードにはヘッダー、検索、Services グループ（PokeTokenDocker の service card 1 枚）と、4 つの公開リンクを持つ Bookmarks グループがあります。埋め込まれた実際の Mini は Pikachu shiny、合成された今日の利用量、進行度、Pokédex 数を表示し、他のコンテナは省略しています。</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="Pikachu shiny と provider メトリクスを表示する PokeTokenDocker Home" width="420"></td><td><strong>📊 Home。</strong><br>Pikachu shiny、進行度、wallet、今日/週の合成値、5 provider、デモ quota、read-only 通知をまとめて表示します。</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="アイコンと個数を表示する PokeTokenDocker Bag" width="380"></td><td><strong>🎒 Bag。</strong><br>単独の Bag 画面で Rare Candy、Mint、Shiny Charm、Poké Doll と個数を表示します。read-only 境界も確認できます。</td></tr>
  <tr><td align="center"><img src="docs/images/shop.png" alt="合成価格を表示する PokeTokenDocker Shop" width="380"></td><td><strong>🛍️ Shop。</strong><br>単独の Shop 画面で進行アイテムとタマゴ tier を合成価格付きで表示します。既定の `public-readonly` では操作が無効です。</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="名前付き sprite を表示する完全な PokeTokenDocker Pokédex" width="520"></td><td><strong>📖 Pokédex。</strong><br>fixture の 42 card を 1 枚に収録し、すべて実名と sprite を表示します。Pikachu shiny の進化ラインも含み、未知の名前はありません。</td></tr>
  <tr><td align="center"><img src="docs/images/catch-log.png" alt="進化チェーンを表示する PokeTokenDocker Catch Log" width="520"></td><td><strong>📜 Catch Log。</strong><br>単独のログで進化チェーン、名前、レア度、性格、ニュートラルなデモ日付を表示します。</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="read-only の PokeTokenDocker Settings" width="520"></td><td><strong>⚙️ Settings。</strong><br>言語、更新間隔、概要、プライバシー、read-only フォルダー、保存、更新、サポートを 1 つのダイアログにまとめています。</td></tr>
</table>

## 🐳 Docker Compose でインストール

Docker Engine と Compose v2、読み取り可能な Hermes データディレクトリ、`/data` 用のホストディレクトリまたは Docker volume が必要です。

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

`.env` の `PTD_HERMES_DIR` を Docker ホスト上の Hermes データパスに変更し、`.env` は commit しないでください。公開済みイメージを取得して既定プロファイルを起動します。

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

ローカルでビルドする場合は `docker compose -f docker/compose.yaml up -d --build` を使います。サービスを確認します。

```shell
curl http://127.0.0.1:4317/healthz
```

<http://127.0.0.1:4317/> を開きます。既定設定は `public-readonly`、`127.0.0.1` bind、`/hermes:ro`、コンパニオン状態 `/data` です。

## 🛡️ 実行モード

| モード | Compose サービス | Port | 変更 | 用途 |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | 無効 | 安全なブラウザ/Homepage 表示。 |
| `docker-local` | `local-integration` profile | `4318` | 明示的に有効 | 購入、設定、状態書き込みのローカルテスト。 |

変更プロファイルは opt-in で loopback に bind し、専用 Docker volume を使います。

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

信頼できない LAN に変更プロファイルを公開しないでください。inventory、進行、設定、wallet を変更するテストには隔離 fixture を使います。

## ⚙️ 設定

Docker 版は `PTD_*` namespace を使います。Windows 版の `PTB_*` とは別です。

| 変数 | 既定値 | 目的 |
| --- | --- | --- |
| `PTD_IMAGE` | `ghcr.io/markussela/poketokendocker:0.1.0` | 公開済みイメージ。Docker Hub またはローカルタグに変更できます。 |
| `PTD_HERMES_DIR` | 必須 | `/hermes` に read-only mount する host directory。 |
| `PTD_DATA_DIR` | `../data` | `/data` に mount する host directory。 |
| `PTD_BIND_HOST` | `127.0.0.1` | port を公開する host interface。 |
| `PTD_ALLOWED_HOSTS` | loopback hosts | 変更 API の Host 許可リスト。 |
| `PTD_WEB_MODE` | `public-readonly` | サービスモード。 |
| `PTD_WEB_ALLOW_MUTATIONS` | `0` | 変更操作の追加ゲート。 |
| `PTD_EMBED_ORIGIN` | 空 | Mini iframe の単一許可 origin。 |
| `PTD_WEB_PORT` | `4317` | コンテナ内部 port。 |

`/hermes` と `/data` は別のパスにしてください。重複したパスは拒否されます。

## 🔗 HTTP API

`GET /healthz`、`GET /api/capabilities`、`GET /api/config`、`GET /api/snapshot`、`GET /api/events`、`POST /api/action`、`GET /mini.html` を提供します。変更操作には JSON、same-origin の Host/Origin 検査、enabled capability が必要です。snapshot contract は private path、raw provider record、credential、無関係な state を除去します。

## 🔒 プライバシーとデータ境界

Hermes/provider は read-only mount、`/data` はコンパニオン状態だけに使用します。既定モードには変更操作がありません。prompt、credential、API key、cookie、token、connection string、database、log、export save を commit しないでください。release checker は read-only で GitHub token を必要としません。詳細は [`SECURITY.md`](SECURITY.md) を参照してください。

## 🧪 ビルドと検証

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.0
docker build -f docker/Dockerfile --build-arg VERSION=0.1.0 -t poketokendocker:local .
```

イメージは非特権の `node` ユーザーで動作し、production dependency と `/healthz` healthcheck を含みます。貢献時は [`CONTRIBUTING.md`](CONTRIBUTING.md) と合成データを使用してください。

## 🔗 リンク

- [リポジトリ](https://github.com/MarkusSela/PokeTokenDocker)
- [コンテナレジストリの説明](docs/CONTAINER-REGISTRIES.md)
- [Releases](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [Issue を報告](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Windows companion](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [元の PokeTokenBar](https://github.com/chattymin/PokeTokenBar)
- [スクリーンショット方針](docs/SCREENSHOTS.md)
- [セキュリティ](SECURITY.md)

## 💛 サポート

役に立った場合は [Ko-fi](https://ko-fi.com/marukoshi) でメンテナンスを支援できます。データへのアクセス権を与えるものではありません。

## 🙏 謝辞

コンパニオンと成長ループのアイデアを提供した [PokeTokenBar](https://github.com/chattymin/PokeTokenBar) に感謝します。Docker、Node.js、sql.js、PokéAPI、PokeAPI/sprites を使用しています。

## 📄 ライセンス

ソースコードは [MIT License](LICENSE) で公開されています。第三者の商標、アートワーク、データの権利は含みません。

PokeTokenDocker は非公式・非商用の fan project です。Nintendo、Game Freak、Creatures Inc.、The Pokémon Company との提携、承認、スポンサー関係はありません。サービスは現状のまま提供されます。
