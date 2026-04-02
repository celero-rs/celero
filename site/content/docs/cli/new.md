---
title: "celero new"
weight: 1
---

Create a new Celero project.

## Usage

```bash
celero new <name> [OPTIONS]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<name>` | Project name (valid Rust identifier). Can include a path: `examples/my-api` |

## Options

| Flag | Description |
|------|-------------|
| `--template <TYPE>` | Template type: `app` or `minimal` |
| `--orm` | Enable SeaORM integration |
| `--telemetry` | Enable OpenTelemetry |
| `--path <PATH>` | Path to local Celero crate (for development) |

## Interactive Mode

Without flags, the CLI guides you through an interactive setup:

```bash
$ celero new myapi

? Select a template:
  > app       -- Structured project with apps/, config/, routes
    minimal   -- Single main.rs file

? Select features:
  [x] ORM (SeaORM integration)
  [ ] Telemetry (OpenTelemetry)

? Create project with this structure? (Y/n)
```

## Non-Interactive Mode

```bash
# App template with ORM and Telemetry
celero new myapi --template app --orm --telemetry

# Minimal without features
celero new myservice --template minimal

# App with ORM, local path
celero new myapi --template app --orm --path ../crates/celero
```

## Templates

### App Template

Structured project with modular architecture:

```
myapi/
├── Cargo.toml
├── .env
├── .gitignore
└── src/
    ├── main.rs
    ├── lib.rs
    ├── config/
    │   ├── mod.rs
    │   ├── settings.rs
    │   └── routes.rs
    └── apps/
        └── core/
            ├── mod.rs
            ├── handlers/
            ├── schemas/
            ├── entities/    # with --orm
            ├── services/    # with --orm
            └── migrations/  # with --orm
```

### Minimal Template

Everything in a single file:

```
myservice/
├── Cargo.toml
├── .gitignore
└── src/
    └── main.rs
```

## Path Names

The `<name>` can include a path. The CLI creates the directory at the given path and uses the last segment as the Rust package name:

```bash
celero new examples/myapi --template minimal
# Creates: examples/myapi/  Package name: myapi
```

## Local Development (`--path`)

When Celero is not yet published on crates.io, use `--path` to reference the local crate:

```bash
celero new myapi --template app --orm --path ../../crates/celero
```

This generates a path-based dependency in `Cargo.toml`:

```toml
celero = { path = "../../crates/celero", features = ["middleware", "orm"] }
```
