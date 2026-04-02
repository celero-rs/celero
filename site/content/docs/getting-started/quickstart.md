---
title: Quick Start
weight: 2
---

Build your first Celero API in under 5 minutes.

## Create a New Project

```bash
celero new my-api
```

The CLI guides you through an interactive setup:
1. **Choose a template** — `app` (structured) or `minimal` (single file)
2. **Select features** — ORM, Telemetry
3. **Confirm** — preview the project structure

For a quick start, choose `minimal` with no extra features:

```bash
celero new my-api --template minimal
```

## Your First API

Open `src/main.rs`:

```rust
use celero::prelude::*;

#[derive(Serialize, Deserialize, Schema)]
struct Message {
    text: String,
}

#[api(get, path = "/hello", tag = "greetings", summary = "Say hello")]
async fn hello() -> Json<Message> {
    Json(Message {
        text: "Hello, World!".into(),
    })
}

#[api(get, path = "/hello/{name}", tag = "greetings", summary = "Greet by name")]
async fn greet(Path(name): Path<String>) -> Json<Message> {
    Json(Message {
        text: format!("Hello, {name}!"),
    })
}

#[tokio::main]
async fn main() {
    let app = Celero::new()
        .title("My First API")
        .version("0.1.0")
        .middleware(Cors::permissive())
        .routes(routes![hello, greet])
        .swagger("/docs")
        .build();

    app.serve("0.0.0.0:3456").await.unwrap();
}
```

## Run It

```bash
cargo run
```

## Try It Out

Open your browser at [http://localhost:3456/docs](http://localhost:3456/docs) to see the Swagger UI.

Or use curl:

```bash
# Health check
curl http://localhost:3456/hello
# {"text":"Hello, World!"}

# With path parameter
curl http://localhost:3456/hello/Alice
# {"text":"Hello, Alice!"}

# View the OpenAPI spec
curl http://localhost:3456/docs/openapi.json
```

## Enable Hot Reload

For automatic recompilation during development:

```bash
celero dev
```

This uses `cargo-watch` (and optionally `systemfd`) to rebuild on file changes.

## What's Next?

- Follow the [Tutorial](../tutorial/overview.md) to build a complete Blog API
- Learn about [Routing & Handlers](../guide/routing.md)
- Add a [Database](../guide/orm.md) to your project
