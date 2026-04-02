---
title: "celero dev"
weight: 3
---

Start the development server with hot reload.

## Usage

```bash
celero dev
```

## Prerequisites

- **Required:** `cargo-watch` — `cargo install cargo-watch`
- **Optional:** `systemfd` — `cargo install systemfd`

## Behavior

| Scenario | Command Executed |
|----------|-----------------|
| `systemfd` installed | `systemfd --no-pid -s http::{port} -- cargo watch -x run` |
| `systemfd` not installed | `cargo watch -x run` |

With `systemfd`, the TCP port stays open during rebuilds (zero downtime in development).

## Port Configuration

The port is read from:
1. `PORT` environment variable
2. `.env` file (`PORT=3456`)
3. Default: `3456`
