use md_todo_backend::{create_app_with_database, create_database_pool};
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "md_todo_backend=debug,tower_http=debug,axum::rejection=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("Starting MD-Todo backend server");

    let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
        "postgres://md_todo_user:md_todo_password@localhost:5432/md_todo_dev".to_string()
    });

    let app = match create_database_pool(&database_url).await {
        Ok(pool) => {
            tracing::info!("Database connected successfully");
            create_app_with_database(pool)
        }
        Err(e) => {
            tracing::error!("Failed to connect to database: {}", e);
            panic!();
        }
    };

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    tracing::info!("Server running on http://0.0.0.0:8000");

    axum::serve(listener, app).await.unwrap();
}
