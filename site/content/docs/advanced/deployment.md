---
title: "Deployment"
weight: 4
---

Celero compiles to a single binary with no runtime dependencies, making deployment straightforward.

## Build for Release

```bash
celero build
# or
cargo build --release
```

The binary is at `target/release/<project-name>`.

## Docker

### Multi-Stage Dockerfile

```dockerfile
FROM rust:1.75-slim AS builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/my-api /usr/local/bin/my-api
EXPOSE 3456
CMD ["my-api"]
```

### Docker Compose

```yaml
services:
  api:
    build: .
    ports:
      - "3456:3456"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/mydb
      HOST: 0.0.0.0
      PORT: 3456
    depends_on:
      - db

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## Systemd

Create `/etc/systemd/system/my-api.service`:

```ini
[Unit]
Description=My Celero API
After=network.target postgresql.service

[Service]
Type=simple
User=api
WorkingDirectory=/opt/my-api
ExecStart=/opt/my-api/my-api
EnvironmentFile=/opt/my-api/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now my-api
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HOST` | No | Bind address (default: `0.0.0.0`) |
| `PORT` | No | Listen port (default: `3456`) |
| `DATABASE_URL` | Yes (with ORM) | Database connection string |
| `JWT_SECRET` | Yes (with JWT) | JWT signing secret |
| `LOG_LEVEL` | No | Log level (default: `info`) |
| `RUST_LOG` | No | Fine-grained log control |

## Database Migrations

Run migrations before starting:

```bash
celero migrate && ./target/release/my-api
```

Or at startup in `main.rs`:

```rust
db.run_migrations::<Migrator>().await.expect("migration failed");
```

## Health Checks

```rust
#[api(get, path = "/healthz")]
async fn health() -> &'static str {
    "ok"
}
```

For database health checks:

```rust
#[api(get, path = "/healthz")]
async fn health(db: Db) -> Result<&'static str, StatusCode> {
    db.execute_unprepared("SELECT 1")
        .await
        .map_err(|_| StatusCode::SERVICE_UNAVAILABLE)?;
    Ok("ok")
}
```

## Production Checklist

- [ ] Compile with `--release`
- [ ] Set strong `JWT_SECRET`
- [ ] Configure CORS for specific origins (not permissive)
- [ ] Set appropriate `Timeout` duration
- [ ] Enable `LogFormat::Json` for log aggregation
- [ ] Set up health check endpoint
- [ ] Configure database connection pool size
- [ ] Run migrations before deployment
