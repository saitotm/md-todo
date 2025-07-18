use md_todo_backend::{create_app_with_database, create_database_pool};
use std::env;

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgres://md_todo_user:md_todo_password@localhost:5432/md_todo_dev".to_string()
    });

    let app = match create_database_pool(&database_url).await {
        Ok(pool) => {
            println!("Database connected successfully");
            create_app_with_database(pool)
        }
        Err(e) => {
            panic!("Failed to connect to database: {}", e);
        }
    };

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("Server running on http://0.0.0.0:8000");

    axum::serve(listener, app).await.unwrap();
}
