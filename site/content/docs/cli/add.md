---
title: "celero add"
weight: 2
---

Add a new app module to an existing project (app template only).

## Usage

```bash
celero add <app_name>
```

## What It Does

1. Creates the module directory under `src/apps/<name>/`
2. Generates `mod.rs`, `handlers/mod.rs`, `schemas/mod.rs`
3. If ORM is enabled: creates `entities/`, `services/`, `migrations/`
4. Updates `src/apps/mod.rs` — adds `pub mod <name>;`
5. Updates `src/config/routes.rs` — wires route collection

## Example

```bash
$ celero add users

App 'users' created successfully!

Files created:
  src/apps/users/
  ├── mod.rs
  ├── handlers/
  │   └── mod.rs
  ├── schemas/
  ├── entities/
  ├── services/
  └── migrations/

Updated:
  src/apps/mod.rs       — added `pub mod users;`
  src/config/routes.rs  — added route collection
```

The generated `handlers/mod.rs` contains an empty `routes()` function:

```rust
use celero::prelude::*;
use celero::router::RouteDefinition;

pub fn routes() -> Vec<RouteDefinition<DbPool>> {
    routes![]
}
```

## Marker Comments

Automatic file updates use marker comments:

```rust
// src/apps/mod.rs
pub mod core;
pub mod users;              // <- inserted by `celero add`
// [celero:app-modules]     // <- marker line
```

```rust
// src/config/routes.rs
pub fn collect_routes() -> Vec<RouteDefinition<DbPool>> {
    let mut all = Vec::new();
    all.extend(apps::core::handlers::routes());
    all.extend(apps::users::handlers::routes());  // <- inserted
    // [celero:app-routes]                         // <- marker
    all
}
```

If markers are removed, the CLI appends content to the end of the file and prints a warning.
