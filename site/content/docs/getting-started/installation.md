---
title: Installation
weight: 1
---

## Requirements

- **Rust 1.75+** (install via [rustup](https://rustup.rs/))
- **Edition 2021**

## Install the CLI

The Celero CLI provides project scaffolding, code generation, and development tools.

```bash
cargo install celero-cli
```

To install from source (if not yet published on crates.io):

```bash
git clone https://github.com/celero-rs/celero
cd celero
cargo install --path crates/celero-cli
```

Verify the installation:

```bash
celero --help
```

## Add Celero to an Existing Project

Add `celero` to your `Cargo.toml`:

```toml
[dependencies]
celero = { version = "0.1", features = ["middleware"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
```

### Optional Features

Enable additional features as needed:

```toml
# With database support
celero = { version = "0.1", features = ["middleware", "orm"] }

# With observability
celero = { version = "0.1", features = ["middleware", "telemetry"] }

# All features
celero = { version = "0.1", features = ["middleware", "orm", "telemetry"] }
```

## Development Tools (Optional)

For hot reload during development:

```bash
cargo install cargo-watch systemfd
```

These enable `celero dev` to automatically rebuild and restart your server when code changes.
