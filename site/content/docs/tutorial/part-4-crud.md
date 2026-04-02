---
title: "Part 4: CRUD Operations"
weight: 4
---

Now let's build the full CRUD API for categories and posts.

## Category Handlers

Replace `src/handlers/categories.rs`:

```rust
use celero::prelude::*;
use crate::entities::category;

#[derive(Deserialize, Schema)]
pub struct CreateCategory {
    pub name: String,
}

#[api(get, path = "/categories", tag = "categories", summary = "List categories")]
pub async fn list_categories(
    db: Db,
    Query(params): Query<PaginationParams>,
) -> Result<Paginated<category::Model>, DbError> {
    paginate(category::Entity::find(), &db, params).await
}

#[api(post, path = "/categories", tag = "categories", summary = "Create category")]
pub async fn create_category(
    db: Db,
    Json(body): Json<CreateCategory>,
) -> Result<(StatusCode, Json<category::Model>), DbError> {
    let model = category::ActiveModel {
        name: Set(body.name),
        ..Default::default()
    };
    let cat = model.insert(&*db).await?;
    Ok((StatusCode::CREATED, Json(cat)))
}
```

## Post Handlers

Create `src/handlers/posts.rs`:

```rust
use celero::prelude::*;
use crate::entities::post;

#[derive(Deserialize, Schema)]
pub struct CreatePost {
    pub title: String,
    pub content: String,
    pub category_id: i32,
}

#[derive(Deserialize, Schema)]
pub struct UpdatePost {
    pub title: Option<String>,
    pub content: Option<String>,
    pub category_id: Option<i32>,
}

#[derive(Deserialize, Schema)]
pub struct PostFilters {
    pub category_id: Option<i32>,
    pub title: Option<String>,
    pub page: Option<u64>,
    pub per_page: Option<u64>,
}

#[api(get, path = "/posts", tag = "posts", summary = "List posts with filters")]
pub async fn list_posts(
    db: Db,
    Query(filters): Query<PostFilters>,
) -> Result<Paginated<post::Model>, DbError> {
    let mut query = post::Entity::find();

    if let Some(cat_id) = filters.category_id {
        query = query.filter(post::Column::CategoryId.eq(cat_id));
    }
    if let Some(ref title) = filters.title {
        query = query.filter(post::Column::Title.contains(title));
    }

    let params = PaginationParams {
        page: filters.page,
        per_page: filters.per_page,
    };
    paginate(query, &db, params).await
}

#[api(get, path = "/posts/{id}", tag = "posts", summary = "Get post by ID")]
pub async fn get_post(Path(id): Path<i32>, db: Db) -> Result<Json<post::Model>, DbError> {
    let post = post::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("Post {id} not found")))?;
    Ok(Json(post))
}

#[api(post, path = "/posts", tag = "posts", summary = "Create post")]
pub async fn create_post(
    db: Db,
    Json(body): Json<CreatePost>,
) -> Result<(StatusCode, Json<post::Model>), DbError> {
    let now = format!(
        "{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    );
    let model = post::ActiveModel {
        title: Set(body.title),
        content: Set(body.content),
        category_id: Set(body.category_id),
        created_at: Set(now),
        ..Default::default()
    };
    let post = model.insert(&*db).await?;
    Ok((StatusCode::CREATED, Json(post)))
}

#[api(put, path = "/posts/{id}", tag = "posts", summary = "Update post")]
pub async fn update_post(
    Path(id): Path<i32>,
    db: Db,
    Json(body): Json<UpdatePost>,
) -> Result<Json<post::Model>, DbError> {
    let existing = post::Entity::find_by_id(id)
        .one(&*db)
        .await?
        .ok_or_else(|| DbError::NotFound(format!("Post {id} not found")))?;

    let mut active: post::ActiveModel = existing.into();
    if let Some(title) = body.title {
        active.title = Set(title);
    }
    if let Some(content) = body.content {
        active.content = Set(content);
    }
    if let Some(category_id) = body.category_id {
        active.category_id = Set(category_id);
    }
    let updated = active.update(&*db).await?;
    Ok(Json(updated))
}

#[api(delete, path = "/posts/{id}", tag = "posts", summary = "Delete post")]
pub async fn delete_post(Path(id): Path<i32>, db: Db) -> Result<StatusCode, DbError> {
    let result = post::Entity::delete_by_id(id).exec(&*db).await?;
    if result.rows_affected == 0 {
        return Err(DbError::NotFound(format!("Post {id} not found")));
    }
    Ok(StatusCode::NO_CONTENT)
}
```

## Register All Routes

Update `src/handlers/mod.rs`:

```rust
pub mod categories;
pub mod posts;
```

Update the `.routes(...)` call in `src/main.rs`:

```rust
.routes(routes![
    categories::list_categories,
    categories::create_category,
    posts::list_posts,
    posts::get_post,
    posts::create_post,
    posts::update_post,
    posts::delete_post,
])
```

## Try It Out

```bash
cargo run
```

```bash
# Create categories
curl -X POST http://localhost:3456/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Rust"}'

# Create a post
curl -X POST http://localhost:3456/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "Getting Started with Rust", "content": "Rust is...", "category_id": 1}'

# Filter posts by category
curl "http://localhost:3456/posts?category_id=1"

# Search by title
curl "http://localhost:3456/posts?title=Rust"

# Update
curl -X PUT http://localhost:3456/posts/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Complete Guide to Rust"}'

# Delete
curl -X DELETE http://localhost:3456/posts/1
```

Next: [Part 5: Authentication ->](part-5-auth.md)
