use md_todo_backend::{create_app, create_app_with_database, create_database_pool, setup_database};
use std::env;

#[tokio::main]
async fn main() {
    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgres://md_todo_user:md_todo_password@localhost:5432/md_todo_dev".to_string()
    });

    let app = match create_database_pool(&database_url).await {
        Ok(pool) => {
            if let Err(e) = setup_database(&pool).await {
                eprintln!("Failed to setup database: {}", e);
                println!("Falling back to in-memory storage");
                create_app()
            } else {
                println!("Database connected successfully");
                create_app_with_database(pool)
            }
        }
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            println!("Falling back to in-memory storage");
            create_app()
        }
    };

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("Server running on http://0.0.0.0:8000");

    axum::serve(listener, app).await.unwrap();
}
