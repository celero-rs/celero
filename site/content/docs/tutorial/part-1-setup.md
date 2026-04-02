---
title: "Part 1: Project Setup"
weight: 1
---

## Create the Project

```bash
celero new blog --template minimal --orm
cd blog
```

This generates a minimal project with ORM support:

```
blog/
├── Cargo.toml
├── .env
├── .gitignore
└── src/
    └── main.rs
```

## Project Structure

We'll create the following structure manually:

```
src/
├── main.rs
├── entities/
│   ├── mod.rs
│   ├── category.rs
│   └── post.rs
├── handlers/
│   ├── mod.rs
│   ├── categories.rs
│   └── posts.rs
└── migration/
    ├── mod.rs
    ├── m20260101_000001_create_categories.rs
    └── m20260101_000002_create_posts.rs
```

## Dependencies

Your `Cargo.toml` should look like this:

```toml
[package]
name = "blog"
version = "0.1.0"
edition = "2021"

[workspace]

[dependencies]
celero = { version = "0.1", features = ["middleware", "orm"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
dotenvy = "0.15"
async-trait = "0.1"

[dev-dependencies]
celero = { version = "0.1", features = ["testing", "middleware", "orm"] }
```

## Environment

Configure `.env`:

```env
APP_NAME=blog
HOST=0.0.0.0
PORT=3456
DATABASE_URL=sqlite://./blog.db?mode=rwc
LOG_LEVEL=info
```

Create the module files:

```bash
mkdir -p src/entities src/handlers src/migration
touch src/entities/mod.rs src/handlers/mod.rs src/migration/mod.rs
```

Next: [Part 2: Defining Routes ->](part-2-routes.md)
