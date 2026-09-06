# Changelog

All notable public changes to PokeTokenDocker are documented here.

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
