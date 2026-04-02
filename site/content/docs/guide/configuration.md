---
title: "Configuration"
weight: 9
---

Celero projects use environment variables for configuration, loaded from a `.env` file or the system environment.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | Project name | Application name |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `3456` | Listen port |
| `DATABASE_URL` | `sqlite://./app.db?mode=rwc` | Database connection string |
| `LOG_LEVEL` | `info` | Log level (`trace`, `debug`, `info`, `warn`, `error`) |
| `RUST_LOG` | — | Overrides `LOG_LEVEL` with fine-grained control |

## The `.env` File

```env
APP_NAME=my-api
HOST=0.0.0.0
PORT=3456
DATABASE_URL=sqlite://./app.db?mode=rwc
LOG_LEVEL=info
```

Load it in `main.rs`:

```rust
dotenvy::dotenv().ok();
```

## Settings Struct

The app template generates a `Settings` struct that loads from env vars:

```rust
pub struct Settings {
    pub app_name: String,
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub log_level: String,
}

impl Settings {
    pub fn from_env() -> Self {
        Self {
            app_name: std::env::var("APP_NAME").unwrap_or_else(|_| "my-api".into()),
            host: std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: std::env::var("PORT")
                .ok()
                .and_then(|p| p.parse().ok())
                .unwrap_or(3456),
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite://./app.db?mode=rwc".into()),
            log_level: std::env::var("LOG_LEVEL").unwrap_or_else(|_| "info".into()),
        }
    }
}
```

## Database URLs

### SQLite

```env
DATABASE_URL=sqlite://./app.db?mode=rwc
```

### PostgreSQL

```env
DATABASE_URL=postgres://user:password@localhost:5432/mydb
```

### MySQL

```env
DATABASE_URL=mysql://user:password@localhost:3306/mydb
```

## Builder Configuration

The `Celero` builder accepts API metadata:

```rust
let app = Celero::new()
    .title("My API")              // OpenAPI info.title
    .version("1.0.0")             // OpenAPI info.version
    .description("My API docs")   // OpenAPI info.description
    .database(db)                 // Database connection pool
    .swagger("/docs")             // Swagger UI path
    .build();
```
