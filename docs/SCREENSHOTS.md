# 📸 Screenshot policy

The README screenshots are real captures of the PokeTokenDocker WebUI rendered from an isolated synthetic fixture. They are documentation assets only; they are not captures of the live container or of a personal account.

The fixture contains generated Pokémon entries, neutral dates, a demonstration progression wallet, and demonstration inventory. It does not mount Hermes, provider folders, `/data`, a real Docker host, or any network account.

## Bundled views

| File | View | Purpose |
| --- | --- | --- |
| [`home.png`](images/home.png) | Full workspace | Home, Bag, Shop, and Pokédex in the four-column web layout. |
| [`home-panel.png`](images/home-panel.png) | Home panel | Active companion, progression, usage summary, provider section, limits, and local-data notice. |
| [`bag.png`](images/bag.png) | Bag | Companion inventory, item counts, and the read-only action boundary. |
| [`shop.png`](images/shop.png) | Shop | Progression items and egg tiers with synthetic prices. |
| [`pokedex.png`](images/pokedex.png) | Pokédex | Animated sprite cards and discovered species. |
| [`catch-log.png`](images/catch-log.png) | Catch Log | Evolution chains, natures, rarity, and neutral demonstration dates. |
| [`settings.png`](images/settings.png) | Settings | Language, refresh, privacy, scan, backup, update, and support controls. |
| [`mini.png`](images/mini.png) | Mini view | Compact [`web/mini.html`](../web/mini.html) view intended for a trusted Homepage or iframe integration. |

## Capture rules

- Capture only the requested Docker web page or panel.
- Do not capture browser chrome, terminals, desktops, trays, unrelated containers, dashboards, or other applications.
- Never capture Hermes databases, provider logs, state exports, credentials, hostnames, personal paths, or real usage values.
- Keep documentation images in `docs/images/` and explain every image in this index and in the README.
- Recreate the isolated fixture before taking new screenshots; do not point the capture process at a live state directory.
