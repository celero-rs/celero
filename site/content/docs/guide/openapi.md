---
title: "OpenAPI & Swagger UI"
weight: 3
---

Celero automatically generates an OpenAPI 3.1 specification from your route definitions and Rust types, with a built-in Swagger UI.

## Quick Setup

```rust
let app = Celero::new()
    .title("My API")
    .version("1.0.0")
    .routes(routes![get_user, create_user])
    .swagger("/docs")  // Enable Swagger UI
    .build();
```

This registers two endpoints:
- `GET /docs` — Interactive Swagger UI
- `GET /docs/openapi.json` — OpenAPI 3.1 JSON specification

## The `#[api]` Macro

The macro analyzes your handler's signature to automatically generate OpenAPI metadata.

### Attributes

| Attribute | Description |
|-----------|-------------|
| `get` / `post` / `put` / `delete` / `patch` | HTTP method (required, first argument) |
| `path = "/..."` | Endpoint path with `{param}` for parameters |
| `tag = "..."` | OpenAPI tag for grouping |
| `summary = "..."` | Short description of the operation |

### Automatic Signature Analysis

The macro inspects argument types to generate metadata:

| Argument Type | OpenAPI Output |
|---------------|----------------|
| `Path<T>` | `parameters` (in: path) |
| `Query<T>` | `parameters` (in: query) — one per field |
| `Json<T>` | `requestBody` (application/json) |
| `State<T>` | Ignored |
| `Db` | Ignored |
| `HeaderMap` | Ignored |

### Return Type Analysis

| Return Type | OpenAPI Response |
|-------------|-----------------|
| `Json<T>` | 200, schema of `T` |
| `(StatusCode, Json<T>)` | 200, schema of `T` |
| `Result<Json<T>, E>` | 200, schema of `T` |
| `String` / `&str` | 200, text/plain |

## Schema Derivation

Use `#[derive(Schema)]` to generate JSON Schema for your types:

```rust
#[derive(Serialize, Deserialize, Schema)]
struct CreateUser {
    /// User's full name
    #[schema(example = "John Doe", min_length = 1, max_length = 100)]
    name: String,

    /// Email address
    #[schema(example = "john@example.com", format = "email")]
    email: String,

    /// Age (optional)
    #[schema(minimum = 0, maximum = 150)]
    age: Option<i32>,
}
```

### Schema Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `example = "..."` | string/number | Example value |
| `max_length = N` | integer | Maximum string length |
| `min_length = N` | integer | Minimum string length |
| `minimum = N` | number | Minimum numeric value |
| `maximum = N` | number | Maximum numeric value |
| `pattern = "..."` | string | Regex validation pattern |
| `format = "..."` | string | Format hint (e.g., "email", "uuid") |

### Supported Types

| Rust Type | JSON Schema Type |
|-----------|-----------------|
| `i8`..`i128`, `u8`..`u128` | `integer` |
| `f32`, `f64` | `number` |
| `bool` | `boolean` |
| `String`, `&str` | `string` |
| `Vec<T>` | `array` (items: schema of `T`) |
| `Option<T>` | Schema of `T` (field not required) |
| `HashMap<K, V>` | `object` (additionalProperties) |

## Manual Schema Implementation

For types that can't use `#[derive(Schema)]` (e.g., SeaORM entities):

```rust
use celero::openapi::CeleroSchema;

impl CeleroSchema for user::Model {
    fn schema() -> serde_json::Value {
        serde_json::json!({
            "type": "object",
            "properties": {
                "id": { "type": "integer", "format": "int64" },
                "name": { "type": "string" },
                "email": { "type": "string", "format": "email" }
            },
            "required": ["id", "name", "email"]
        })
    }

    fn schema_name() -> String {
        "User".to_string()
    }
}
```

> **Tip:** SeaORM entity `Model` types can use `#[derive(Schema)]` alongside SeaORM derives. Use `#[schema(name = "User")]` to set the schema name (all SeaORM entities are named `Model` internally).
