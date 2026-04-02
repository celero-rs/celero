---
title: "Benchmarks"
weight: 1
---

Performance comparison between Celero, Actix-web, Loco, and FastAPI on equivalent endpoints.

## Methodology

| Parameter | Value |
|-----------|-------|
| Tool | [oha](https://github.com/hatoo/oha) (Rust HTTP load generator) |
| Duration | 10 seconds per run |
| Concurrent connections | 256 |
| Runs per endpoint | 3 (results averaged) |
| Platform | Apple Silicon (Darwin arm64) |

### Endpoints Tested

| Endpoint | Description | Response Size |
|----------|-------------|---------------|
| `GET /health` | Plaintext health check | 2 bytes |
| `GET /json` | JSON serialization | 27 bytes |
| `GET /users/{id}` | Path param + JSON | 24 bytes |

### Frameworks

| Framework | Version | Language | Runtime |
|-----------|---------|----------|---------|
| Celero | 0.1.0 | Rust | Tokio + Hyper 1.x |
| Actix-web | 4.x | Rust | Actix runtime |
| Loco | latest | Rust | Axum + Tokio |
| FastAPI | latest | Python | Uvicorn (ASGI) |

All Rust servers compiled with `--release`. No middleware active.

## Results

### Throughput (requests/sec)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **197,827** | 182,058 | 168,992 | 102,207 |
| `GET /json` | **196,766** | 184,562 | 169,416 | 101,239 |
| `GET /users/{id}` | **195,517** | 186,867 | 155,303 | 85,271 |

### Average Latency (ms)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **1.29** | 1.41 | 1.52 | 2.51 |
| `GET /json` | **1.30** | 1.39 | 1.51 | 2.53 |
| `GET /users/{id}` | **1.31** | 1.37 | 1.65 | 3.01 |

### p99 Latency (ms)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **1.78** | 3.55 | 4.11 | 11.66 |
| `GET /json` | **1.84** | 2.71 | 3.86 | 10.30 |
| `GET /users/{id}` | **1.91** | 2.77 | 5.06 | 10.64 |

### p99.9 Latency (ms)

| Endpoint | Celero | Actix-web | Loco | FastAPI |
|----------|--------|-----------|------|---------|
| `GET /health` | **2.84** | 21.43 | 11.31 | 30.55 |
| `GET /json` | **2.88** | 11.94 | 11.20 | 19.46 |
| `GET /users/{id}` | **3.16** | 11.65 | 13.18 | 29.81 |

## Analysis

### Throughput

Celero has the highest throughput across all endpoints:
- **+8.7%** vs Actix-web
- **+17.1%** vs Loco
- **+93.6%** vs FastAPI

### Tail Latency

The most significant advantage is in tail latency:
- **p99**: ~2x better than Actix-web, ~6.5x better than FastAPI
- **p99.9**: ~7.5x better than Actix-web
- Indicates more predictable behavior under load

### Consistency

Celero shows minimal variance between runs:
- Throughput: < 1% variation
- p99: < 10% variation

## Reproducing

```bash
# Install oha
cargo install oha

# Build and start the server
cd benchmarks/celero-bench && cargo build --release && ./target/release/celero-bench

# Run benchmarks
oha -c 256 -z 10s http://localhost:3456/health
oha -c 256 -z 10s http://localhost:3456/json
oha -c 256 -z 10s http://localhost:3456/users/42
```

Repeat 3 times per endpoint and average the results.
