# Container registries

PokeTokenDocker publishes a versioned multi-architecture image through GitHub Actions.

## GitHub Container Registry

The tagged release workflow publishes:

```text
ghcr.io/markussela/poketokendocker:<version>
ghcr.io/markussela/poketokendocker:latest
```

The default Compose configuration uses the versioned GHCR image. The package must be public in the repository's **Packages** settings before unauthenticated users can pull it.

## Docker Hub

Docker Hub publication is intentionally manual. It requires a Docker Hub access token stored as a GitHub Actions repository secret:

- `DOCKERHUB_USERNAME` — the Docker Hub account used to log in;
- `DOCKERHUB_TOKEN` — a Docker Hub access token, never a password in source control.

Configure the secrets with GitHub's repository settings or the `gh` CLI. Then run **Actions → Publish Docker Hub image → Run workflow**, supplying the lowercase Docker Hub namespace and a semantic version such as `0.1.0`.

The workflow publishes:

```text
docker.io/<namespace>/poketokendocker:<version>
docker.io/<namespace>/poketokendocker:latest
```

To use that image with Compose, set this in `.env`:

```dotenv
PTD_IMAGE=docker.io/<namespace>/poketokendocker:0.1.0
```

Never put a registry token, password, or private repository URL in `.env`, README files, issues, screenshots, or commits.
