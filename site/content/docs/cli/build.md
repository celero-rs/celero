---
title: "celero build"
weight: 4
---

Compile a release build and report binary size.

## Usage

```bash
celero build
```

## Output

```
Building release binary...

Release binary: target/release/myapi
Binary size:    4.2 MB
```

Internally runs `cargo build --release`.
