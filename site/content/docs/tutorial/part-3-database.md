---
title: "Part 3: Adding a Database"
weight: 3
---

Now let's connect to a real database with SeaORM.

## Write Migrations

Create `src/migration/m20260101_000001_create_categories.rs`:

```rust
use celero::sea_orm_migration;
use celero::sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Categories::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Categories::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Categories::Name).string().not_null().unique_key())
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Categories::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
pub enum Categories {
    Table,
    Id,
    Name,
}
```

Create `src/migration/m20260101_000002_create_posts.rs`:

```rust
use celero::sea_orm_migration;
use celero::sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Posts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Posts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Posts::Title).string().not_null())
                    .col(ColumnDef::new(Posts::Content).text().not_null())
                    .col(ColumnDef::new(Posts::CategoryId).integer().not_null())
                    .col(ColumnDef::new(Posts::CreatedAt).string().not_null().default(""))
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_posts_category_id")
                            .from(Posts::Table, Posts::CategoryId)
                            .to(
                                super::m20260101_000001_create_categories::Categories::Table,
                                super::m20260101_000001_create_categories::Categories::Id,
                            )
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Posts::Table).to_owned()).await
    }
}

#[derive(DeriveIden)]
enum Posts {
    Table,
    Id,
    Title,
    Content,
    CategoryId,
    CreatedAt,
}
```

Register them in `src/migration/mod.rs`:

```rust
use celero::sea_orm_migration::prelude::*;

pub mod m20260101_000001_create_categories;
pub mod m20260101_000002_create_posts;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20260101_000001_create_categories::Migration),
            Box::new(m20260101_000002_create_posts::Migration),
        ]
    }
}
```

## Define Entities

Create `src/entities/category.rs`:

```rust
use celero::prelude::*;
use celero::sea_orm;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize, Schema)]
#[sea_orm(table_name = "categories")]
#[schema(name = "Category")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub name: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::post::Entity")]
    Posts,
}

impl Related<super::post::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Posts.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
```

Create `src/entities/post.rs`:

```rust
use celero::prelude::*;
use celero::sea_orm;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel, Serialize, Deserialize, Schema)]
#[sea_orm(table_name = "posts")]
#[schema(name = "Post")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    #[sea_orm(column_type = "Text")]
    pub content: String,
    pub category_id: i32,
    pub created_at: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::category::Entity",
        from = "Column::CategoryId",
        to = "super::category::Column::Id"
    )]
    Category,
}

impl Related<super::category::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Category.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
```

Update `src/entities/mod.rs`:

```rust
pub mod category;
pub mod post;
```

## Connect in main.rs

```rust
use celero::prelude::*;

mod entities;
mod handlers;
mod migration;

use handlers::categories;
use migration::Migrator;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let db_url = std::env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite://./blog.db?mode=rwc".into());

    let db = DbPool::connect(&db_url).await.expect("failed to connect");
    db.run_migrations::<Migrator>().await.expect("migration failed");

    let app = Celero::new()
        .title("Blog API")
        .version("0.1.0")
        .database(db)
        .middleware(Cors::permissive())
        .middleware(RequestId)
        .middleware(Timeout::from_secs(30))
        .routes(routes![categories::list_categories])
        .swagger("/docs")
        .build();

    let addr = "0.0.0.0:3456";
    println!("Server running on http://{addr}");
    println!("Swagger UI: http://{addr}/docs");
    app.serve(addr).await.unwrap();
}
```

Next: [Part 4: CRUD Operations ->](part-4-crud.md)
