<p align="center">
  <img src="assets/emerald-egg-static.png" width="132" alt="PokeTokenDocker 알">
</p>

<h1 align="center">PokeTokenDocker</h1>

<p align="center">
  <strong>로컬 AI 코딩 사용량을 Pokémon 워크스페이스로 바꿉니다.</strong><br>
  사용 메타데이터를 성장, 수집, 집중된 웹 컴패니언으로 바꾸는 local-first Docker 서비스입니다.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-2ea44f" alt="MIT 라이선스"></a>
  <a href="docker/Dockerfile"><img src="https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white" alt="Docker 지원"></a>
  <a href="package.json"><img src="https://img.shields.io/badge/Node.js-%3E%3D22-5fa04e?logo=node.js&logoColor=white" alt="Node.js 22 이상"></a>
</p>

<p align="center" aria-label="언어 선택">
  <a href="README.md">🇬🇧 English</a>
  &nbsp;|&nbsp;
  <a href="README.zh-CN.md">🇨🇳 简体中文</a>
  &nbsp;|&nbsp;
  <a href="README.it.md">🇮🇹 Italiano</a>
  &nbsp;|&nbsp;
  <a href="README.ja.md">🇯🇵 日本語</a>
  &nbsp;|&nbsp;
  <a href="README.ko.md"><strong>🇰🇷 한국어</strong></a>
  &nbsp;|&nbsp;
  <a href="README.es.md">🇪🇸 Español</a>
  &nbsp;|&nbsp;
  <a href="README.fr.md">🇫🇷 Français</a>
  &nbsp;|&nbsp;
  <a href="README.pt.md">🇵🇹 Português</a>
</p>

> **소스 패키지:** `0.1.1` · Docker/Web 빌드 · 기본 Compose 프로필은 `public-readonly` 로컬 read-only입니다.
>
> **게시된 이미지:** `ghcr.io/markussela/poketokendocker:0.1.1` · `PTD_IMAGE`로 Docker Hub 또는 로컬 태그를 사용할 수 있습니다.

## 프로젝트 소개

PokeTokenDocker는 기존 컴패니언 개념의 headless Web 빌드입니다. 로컬 AI 코딩 사용량이 알, 컴패니언, 성장하는 Pokédex로 이어집니다. Docker 컨테이너가 사용 메타데이터를 읽고 브라우저에서 컴패니언을 제공하도록 서버, NAS 또는 신뢰할 수 있는 로컬 머신을 위해 설계되었습니다.

Hermes와 provider 디렉터리는 **읽기 전용**으로 마운트됩니다. 명시적으로 변경 가능한 로컬 프로필을 켠 경우에만 컴패니언 상태가 `/data`에 기록됩니다. 기본 `public-readonly` 프로필은 구매, 설정 저장, 가져오기 및 기타 변경을 비활성화합니다. SSH, Tailscale, Home Assistant, 원격 데이터베이스 또는 텔레메트리는 필요하지 않습니다.

이 저장소는 Docker/Web 버전이며 Windows tray 앱과는 런타임 및 설정이 다릅니다.

## ✨ 기능

- 🏠 **웹 워크스페이스:** Home, Bag, Shop, Pokédex, Catch Log, Settings를 하나의 반응형 페이지에서 제공합니다.
- 📈 **사용량 기반 성장:** 로컬 메타데이터로 알 또는 현재 컴패니언을 진행시키고 단계, 희귀도, 성격, 졸업 상태를 기록합니다.
- 📚 **컬렉션:** Pokédex는 발견한 종을, Catch Log는 진화 체인과 포획 기록을 보관합니다.
- 🎒 **보상 루프:** Rare Candy, Mint, Shiny Charm, Poké Doll 및 알 등급은 provider 계정이 아닌 컴패니언 상태에 속합니다.
- 🔄 **실시간 상태:** SSE로 snapshot과 activity 이벤트를 받아 전체 페이지 새로고침 없이 갱신합니다.
- 🧩 **Mini 보기:** [`web/mini.html`](web/mini.html)은 신뢰할 수 있는 Homepage 또는 iframe용입니다.
- 🌍 **7개 UI 언어:** 영어, 이탈리아어, 한국어, 일본어, 스페인어, 프랑스어, 포르투갈어.
- 🔒 **안전한 기본값:** Compose는 loopback과 `public-readonly`로 시작합니다.

## 🔁 성장 방식

1. 컨테이너가 읽기 전용 Hermes/provider mount에서 사용 메타데이터를 읽습니다.
2. 로컬 서비스가 token, 비용, 세션, provider 합계를 정규화합니다.
3. 새 사용량이 현재 알 또는 진화 단계를 진행합니다.
4. 부화, 진화, 희귀도, 성격, shiny, 컬렉션 상태를 컴패니언 상태에 저장합니다.
5. WebUI가 snapshot을 표시하고 Server-Sent Events로 이후 업데이트를 받습니다.

상태를 Hermes나 provider 원본에 다시 쓰지 않습니다.

## 🔌 지원하는 로컬 소스

내장 reader는 Claude Code, Gemini, Antigravity, Codex, OpenCode, Cursor, Grok, GitHub Copilot, Kiro, Pi Agent 및 Hermes Agent 로컬 SQLite 사용량을 지원합니다. Settings에서 JSON/JSONL 폴더를 추가할 수 있으며 추가 스캔도 읽기 전용입니다.

공식 quota는 소스가 제공할 때만 표시하고, 사용할 수 없으면 값을 만들어내지 않습니다.

## 📸 스크린샷

갤러리는 격리된 합성 fixture에서 캡처한 8개 화면과 프로젝트가 제공한 Homepage 카드 참조 이미지로 구성됩니다. fixture 화면에는 데모 값만 있으며, 참조 이미지는 이번 릴리스에 맞게 리브랜딩했고 호스트, 계정, 자격 증명 또는 개인 경로를 포함하지 않습니다. 전체 정책과 목록은 [`docs/SCREENSHOTS.md`](docs/SCREENSHOTS.md)를 참고하세요.

<table>
  <tr><td align="center"><img src="docs/images/home.png" alt="반짝이는 Pikachu와 이름이 표시된 Pokémon이 있는 PokeTokenDocker 웹 워크스페이스" width="520"></td><td><strong>🏠 워크스페이스.</strong><br>넓은 레이아웃에서 Home, Bag, Shop, Pokédex를 함께 표시합니다. 반짝이는 Pikachu가 중심이며 Home에는 합성 token 값과 5개의 데모 provider가 보입니다.</td></tr>
  <tr><td align="center"><img src="docs/images/mini.png" alt="PokeTokenDocker Mini 서비스 카드 하나와 공개 링크가 있는 Homepage 대시보드" width="520"></td><td><strong>🧩 Homepage의 Mini.</strong><br>이 Homepage 대시보드에는 헤더, 검색, PokeTokenDocker service card 하나만 있는 Services 그룹과 네 개의 공개 링크가 있는 Bookmarks 그룹이 있습니다. 삽입된 실제 Mini는 반짝이는 Pikachu, 합성 오늘 사용량, 진행도, Pokédex 수를 보여주며 다른 컨테이너는 개인정보 보호를 위해 표시하지 않습니다.</td></tr>
  <tr><td align="center"><img src="docs/images/homepage.png" alt="반짝이는 Pikachu와 8M today를 보여주는 PokeTokenDocker Homepage 카드" width="520"></td><td><strong>🌐 Homepage 카드 프리뷰.</strong><br>이번 릴리스를 위해 제공된 컴팩트 카드는 PokeTokenDocker 이름을 사용하며 반짝이는 Pikachu, Jolly 성격, 1/1 단계, 3분의 1 진행도와 표시 예시인 8M today를 보여줍니다. 호스트, 계정, 자격 증명 또는 개인 경로는 포함하지 않습니다.</td></tr>
  <tr><td align="center"><img src="docs/images/home-panel.png" alt="반짝이는 Pikachu와 provider 지표가 있는 PokeTokenDocker Home" width="420"></td><td><strong>📊 Home.</strong><br>반짝이는 Pikachu, 진행도, wallet, 합성 오늘/주간 합계, 5개 provider, 데모 quota와 read-only 안내를 한 패널에 표시합니다.</td></tr>
  <tr><td align="center"><img src="docs/images/bag.png" alt="아이콘과 수량이 있는 PokeTokenDocker Bag" width="380"></td><td><strong>🎒 Bag.</strong><br>별도의 Bag 화면에서 Rare Candy, Mint, Shiny Charm, Poké Doll과 수량을 보여줍니다. read-only 경계도 표시됩니다.</td></tr>
  <tr><td align="center"><img src="docs/images/shop.png" alt="합성 가격이 있는 PokeTokenDocker Shop" width="380"></td><td><strong>🛍️ Shop.</strong><br>별도의 Shop 화면에서 진행 아이템과 egg tier를 합성 가격과 함께 표시합니다. 기본 `public-readonly` 프로필에서는 조작이 비활성화됩니다.</td></tr>
  <tr><td align="center"><img src="docs/images/pokedex.png" alt="이름 있는 sprite가 표시된 완전한 PokeTokenDocker Pokédex" width="520"></td><td><strong>📖 Pokédex.</strong><br>fixture의 42개 card를 한 장에 담고 모든 실제 Pokémon 이름과 sprite를 표시합니다. 반짝이는 Pikachu 진화 라인도 포함하며 알 수 없는 이름이 없습니다.</td></tr>
  <tr><td align="center"><img src="docs/images/catch-log.png" alt="진화 체인이 있는 PokeTokenDocker Catch Log" width="520"></td><td><strong>📜 Catch Log.</strong><br>별도의 로그에서 진화 체인, 읽을 수 있는 이름, 희귀도, 성격과 중립적인 데모 날짜를 보여줍니다.</td></tr>
  <tr><td align="center"><img src="docs/images/settings.png" alt="read-only PokeTokenDocker Settings" width="520"></td><td><strong>⚙️ Settings.</strong><br>언어, 새로고침, 요약, 개인정보 보호, read-only 폴더, 저장, 업데이트와 지원 링크를 한 대화상자에 모았습니다.</td></tr>
</table>

## 🐳 Docker Compose 설치

Docker Engine과 Compose v2, 읽을 수 있는 Hermes 데이터 디렉터리, `/data`용 호스트 디렉터리 또는 Docker volume이 필요합니다.

```shell
git clone https://github.com/MarkusSela/PokeTokenDocker.git
cd PokeTokenDocker
cp docker/ptd.env.example .env
```

`.env`에서 `PTD_HERMES_DIR`를 Docker 호스트의 Hermes 데이터 경로로 바꾸고 `.env`는 commit하지 마세요. 게시된 이미지를 가져와 기본 프로필을 시작합니다.

```shell
docker compose -f docker/compose.yaml pull
docker compose -f docker/compose.yaml up -d
```

로컬에서 빌드하려면 `docker compose -f docker/compose.yaml up -d --build`를 사용하세요. 서비스를 확인합니다.

```shell
curl http://127.0.0.1:4317/healthz
```

<http://127.0.0.1:4317/>를 엽니다. 기본 설정은 `public-readonly`, `127.0.0.1` bind, `/hermes:ro`, 컴패니언 상태 `/data`입니다.

## 🛡️ 실행 모드

| 모드 | Compose 서비스 | 포트 | 변경 | 용도 |
| --- | --- | ---: | --- | --- |
| `public-readonly` | `poketokendocker` | `4317` | 비활성화 | 안전한 브라우저 또는 read-only Homepage. |
| `docker-local` | `local-integration` profile | `4318` | 명시적으로 활성화 | 구매, 설정, 상태 쓰기 로컬 테스트. |

변경 profile은 opt-in이며 loopback에만 bind하고 별도 Docker volume을 사용합니다.

```shell
docker compose -f docker/compose.yaml --profile local-integration up -d --build poketokendocker-local-integration
```

신뢰할 수 없는 LAN에 변경 profile을 공개하지 마세요. inventory, 진행도, 설정 또는 wallet을 변경하는 테스트에는 격리 fixture를 사용하세요.

## ⚙️ 설정

Docker 버전은 `PTD_*` namespace를 사용하며 Windows 버전의 `PTB_*`와 다릅니다.

| 변수 | 기본값 | 목적 |
| --- | --- | --- |
| `PTD_IMAGE` | `ghcr.io/markussela/poketokendocker:0.1.1` | 게시된 이미지. Docker Hub 또는 로컬 태그로 변경할 수 있습니다. |
| `PTD_HERMES_DIR` | 필수 | `/hermes`에 read-only로 마운트할 호스트 디렉터리. |
| `PTD_DATA_DIR` | `../data` | `/data`에 마운트할 호스트 디렉터리. |
| `PTD_BIND_HOST` | `127.0.0.1` | 포트를 공개할 호스트 인터페이스. |
| `PTD_ALLOWED_HOSTS` | loopback hosts | 변경 API 요청에 허용되는 Host. |
| `PTD_WEB_MODE` | `public-readonly` | 서비스 모드. |
| `PTD_WEB_ALLOW_MUTATIONS` | `0` | 변경 작업을 위한 추가 gate. |
| `PTD_EMBED_ORIGIN` | 비어 있음 | Mini iframe에 허용할 단일 origin. |
| `PTD_WEB_PORT` | `4317` | 컨테이너 내부 포트. |

`/hermes`와 `/data`는 분리된 경로여야 하며 겹치는 경로는 거부됩니다.

## 🔗 HTTP API

`GET /healthz`, `GET /api/capabilities`, `GET /api/config`, `GET /api/snapshot`, `GET /api/events`, `POST /api/action`, `GET /mini.html`을 제공합니다. 변경 작업은 JSON, same-origin Host/Origin 검사, 활성화된 capability가 필요합니다. snapshot contract는 private path, 원본 provider record, credential, 관련 없는 상태를 제거합니다.

## 🔒 개인정보와 데이터 경계

Hermes/provider는 read-only mount이며 `/data`에는 컴패니언 상태만 저장합니다. 기본 모드에는 변경 작업이 없습니다. prompt, credential, API key, cookie, token, connection string, database, log, export save를 commit하지 마세요. release checker는 read-only이고 GitHub token을 필요로 하지 않습니다. 자세한 내용은 [`SECURITY.md`](SECURITY.md)를 확인하세요.

## 🧪 빌드 및 검증

```shell
npm ci
npm test
node scripts/audit-release.cjs
npm audit --omit=dev --audit-level=high
docker pull ghcr.io/markussela/poketokendocker:0.1.1
docker build -f docker/Dockerfile --build-arg VERSION=0.1.1 -t poketokendocker:local .
```

이미지는 권한이 없는 `node` 사용자로 실행되며 production 의존성과 `/healthz` healthcheck만 포함합니다. 기여할 때는 [`CONTRIBUTING.md`](CONTRIBUTING.md)와 합성 데이터를 사용하세요.

## 🔗 링크

- [프로젝트 저장소](https://github.com/MarkusSela/PokeTokenDocker)
- [컨테이너 레지스트리 안내](docs/CONTAINER-REGISTRIES.md)
- [Releases](https://github.com/MarkusSela/PokeTokenDocker/releases)
- [문제 신고](https://github.com/MarkusSela/PokeTokenDocker/issues/new)
- [Windows companion](https://github.com/MarkusSela/PokeTokenBarWindows-Lab)
- [원본 PokeTokenBar 프로젝트](https://github.com/chattymin/PokeTokenBar)
- [스크린샷 정책](docs/SCREENSHOTS.md)
- [보안 안내](SECURITY.md)

## 💛 지원

PokeTokenDocker가 유용하다면 [Ko-fi](https://ko-fi.com/marukoshi)에서 유지보수를 지원할 수 있습니다. 지원은 데이터 접근 권한을 주지 않으며 로컬 개인정보 경계를 바꾸지 않습니다.

## 🙏 감사

컴패니언 개념과 성장 루프의 영감을 준 [PokeTokenBar](https://github.com/chattymin/PokeTokenBar)에 감사드립니다. Docker, Node.js, sql.js, PokéAPI, PokeAPI/sprites도 사용합니다.

## 📄 라이선스

소스 코드는 [MIT License](LICENSE)로 공개됩니다. 이 라이선스는 이 프로젝트의 소스 코드에만 적용되며 제3자 상표, 아트워크 또는 데이터에 대한 권리를 부여하지 않습니다.

PokeTokenDocker는 비공식·비상업 fan project입니다. Nintendo, Game Freak, Creatures Inc., The Pokémon Company와 제휴, 승인 또는 후원 관계가 없습니다. 서비스는 보증 없이 “있는 그대로” 제공됩니다.
