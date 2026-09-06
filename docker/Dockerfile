ARG VERSION=0.1.1
FROM node:22-bookworm-slim
ARG VERSION

LABEL org.opencontainers.image.title="PokeTokenDocker" \
      org.opencontainers.image.description="A local-first Docker companion that turns local AI coding usage into Pokémon progress." \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.source="https://github.com/MarkusSela/PokeTokenDocker" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY core ./core
COPY server ./server
COPY web ./web
COPY assets ./assets

RUN mkdir -p /data && chown -R node:node /app /data
USER node

ENV NODE_ENV=production \
    PTD_WEB_HOST=0.0.0.0 \
    PTD_WEB_PORT=4317 \
    PTD_WEB_MODE=public-readonly \
    PTD_WEB_ALLOW_MUTATIONS=0 \
    PTD_WEB_CONTAINER=1 \
    PTD_STATE_DIR=/data \
    PTD_PROJECT_URL=https://github.com/MarkusSela/PokeTokenDocker \
    PTD_ISSUES_URL=https://github.com/MarkusSela/PokeTokenDocker/issues \
    PTD_RELEASE_URL=https://api.github.com/repos/MarkusSela/PokeTokenDocker/releases/latest

EXPOSE 4317

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4317/healthz').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"

CMD ["node", "server/cli.cjs"]
