# 📸 Screenshot policy

The README screenshot gallery contains real captures of the PokeTokenDocker WebUI rendered from an isolated synthetic fixture. The `homepage.png` row is a project-owner-provided compact Homepage card reference, rebranded for this release. These are documentation assets only; they are not captures of the live container or of a personal account.

The fixture contains a shiny Pikachu companion, named Pokémon entries, neutral dates, five demonstration providers, synthetic token totals and quota windows, a demonstration progression wallet, and demonstration inventory. It does not mount Hermes, provider folders, `/data`, a real Docker host, or any network account.

## Bundled views

| File | View | Purpose |
| --- | --- | --- |
| [`home.png`](images/home.png) | Full workspace | Wide Home, Bag, Shop, and Pokédex layout with shiny Pikachu, synthetic usage/provider data, and named Pokémon cards. |
| [`mini.png`](images/mini.png) | Homepage Mini view | Real Homepage dashboard capture with header, search, Services, and Bookmarks: exactly one service card, `PokeTokenDocker`, the real [`web/mini.html`](../web/mini.html) embedded, and four public links. Other containers are intentionally absent. |
| [`homepage.png`](images/homepage.png) | Homepage card reference | Project-owner-provided compact Homepage card, rebranded to `PokeTokenDocker` for this release; shows shiny Pikachu, Jolly nature, hatch phase 1/1, one-third progress, and the visible `8M today` example. It contains no host, account, credential, or private-path data. |
| [`home-panel.png`](images/home-panel.png) | Home panel | Shiny Pikachu, progression, usage summary, five demonstration providers, quota windows, and the read-only boundary. |
| [`bag.png`](images/bag.png) | Bag | Companion inventory, item counts, item icons, and the read-only action boundary. |
| [`shop.png`](images/shop.png) | Shop | Progression items and egg tiers with synthetic prices, shown as a separate Shop capture. |
| [`pokedex.png`](images/pokedex.png) | Pokédex | The complete 42-card fixture collection; every card has a readable Pokémon name and a loaded sprite. |
| [`catch-log.png`](images/catch-log.png) | Catch Log | Evolution chains, readable names, natures, rarity, and neutral demonstration dates. |
| [`settings.png`](images/settings.png) | Settings | Language, refresh, privacy, scan, backup, update, and support controls in read-only mode. |

## Capture rules

- Capture only the requested Docker web page or panel.
- The Mini image is captured on a synthetic Homepage dashboard with header, search, `Services`, and `Bookmarks`; it contains exactly one `PokeTokenDocker` service card plus public links, and unrelated containers are never shown.
- Never capture browser chrome, terminals, desktops, trays, unrelated containers, dashboards, or other applications.
- Never capture Hermes databases, provider logs, state exports, credentials, hostnames, personal paths, or real usage values. The provided `homepage.png` is a presentation reference supplied by the project owner; do not treat its visible example value as a usage report.
- Keep documentation images in `docs/images/` and explain every image in this index and in the README.
- Recreate the isolated fixture before taking new screenshots; do not point the capture process at a live state directory.
- Before publishing a replacement, verify that Pokédex card names are not `#?`, `?`, or blank and that every card sprite has loaded.
