# 🔒 Security notes

PokeTokenDocker is designed for a local or trusted-LAN deployment, with the safest profile enabled by default.

- Hermes and provider directories are mounted read-only.
- The companion writes only its own `/data` state directory.
- The default Compose bind is loopback-only and `docker-local` mutations are explicitly opt-in through the mode and allow flag.
- The image runs as the unprivileged `node` user.
- No credentials, tokens, prompts, raw paths, provider databases, or personal state belong in the repository or image.
- The update checker is read-only. Private GitHub releases need a public manifest or an external authenticated service; do not put a GitHub token in Compose or the image.

Report security problems through the configured issue/support link rather than publishing sensitive details.
