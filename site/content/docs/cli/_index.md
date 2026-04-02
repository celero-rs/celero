---
title: "CLI Reference"
weight: 5
---

The Celero CLI provides project scaffolding, code generation, development tools, and database migration management.

## Installation

```bash
cargo install celero-cli
```

## Commands

| Command | Description |
|---------|-------------|
| [`celero new`](new/) | Create a new Celero project |
| [`celero add`](add/) | Add an app module to an existing project |
| [`celero dev`](dev/) | Run with hot reload |
| [`celero build`](build/) | Release build with binary size report |
| [`celero makemigrations`](makemigrations/) | Auto-generate migrations from entity changes |
| [`celero migrate`](migrate/) | Apply pending database migrations |

## Non-Interactive Mode

All commands support non-interactive mode for CI/scripting by passing explicit flags:

```bash
celero new myapi --template app --orm --telemetry
```

When `--template` is specified, interactive prompts are skipped.

## Technical Notes

- The CLI is a standalone binary with no dependency on the Celero framework
- Templates are pure Rust code generation functions
- Project names are validated as valid Rust identifiers
- Each generated project includes an isolated `[workspace]` in its `Cargo.toml`
