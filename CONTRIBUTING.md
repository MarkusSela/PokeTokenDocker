# 🤝 Contributing to PokeTokenDocker

Keep changes focused on the headless Docker runtime and web UI.

```shell
npm ci
npm test
node scripts/audit-release.cjs
```

Do not commit `.env` files, database/WAL files, companion state, provider logs, credentials, or personal screenshots. Do not publish, push, or restart unrelated services from a contributor workflow.
