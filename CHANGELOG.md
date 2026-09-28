# Changelog

## 0.2.2

Shop inventory visibility release.

- Keeps every Bag item in the Shop, including already-owned unique items.
- Leaves owned unique-item purchase controls disabled while keeping the item visible.
- Documents the complete Shop catalog in all localized README files.

## 0.2.1

UI polish release.

- Aligns the Shop heading and wallet summary with the Bag panel header.
- Reduces the Pokédex grid to a maximum of three columns on wide layouts for readable cards.

## 0.2.0

Parity work against the Windows v0.2.0 directive.

- Ships the complete National Dex catalog (1,025 species and 540 evolution chains) offline.
- Adds Exp. Candy XL, Hatch Incubator, Shiny Incense, report-aligned economy, effective hatch thresholds, shiny odds, and consumption semantics.
- Adds byte-identical state migration backups, SHA-256 verification, rollback, and the `npm run migrate:state` CLI.
- Adds a 24-species Pokédex pager, four-column collection grid, sticky rarity filter, and a three-column responsive Shop layout.
- Adds browser-configurable animated/Pixel Gen V sprites, companion and Gold walking overlays, object badges, and the shipped Windows v0.2.0 item assets.
- Extends the sanitized snapshot contract and all localized UI strings for the new items.

## 0.1.1

Branding and documentation refresh for the PokeTokenDocker release.

- Aligns the public product identity, Docker defaults, user-agent, README variants, and release checks on `PokeTokenDocker` and version `0.1.1`.
- Adds the project-owner-provided, rebranded Homepage card reference to the public documentation gallery.
- Keeps the original project and Windows companion names intact where they are external attribution or link destinations.

## 0.1.0

First public Docker/web release.

- Ships a local-first Docker service with a loopback-bound `public-readonly` default.
- Reads Hermes and supported provider usage through read-only mounts.
- Keeps companion state separate under `/data` and never writes back to source usage data.
- Includes the responsive Home, Bag, Shop, Pokédex, Catch Log, Settings, and Mini views.
- Includes English, Italian, Chinese, Japanese, Korean, Spanish, French, and Portuguese README variants.
- Publishes a versioned multi-architecture image through the GitHub Container Registry workflow.
- Keeps Docker Hub publication available as an explicit manual workflow using repository secrets.
- Uses the sanitized collection name fallback so discovered Pokémon names render correctly in the Pokédex.

### Release notes

- The source package is MIT-licensed.
- Pokémon names, imagery, marks, and third-party data remain subject to their respective owners and terms; see [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).
- Do not publish Hermes data, provider records, wallet state, logs, exports, credentials, or local configuration files.
