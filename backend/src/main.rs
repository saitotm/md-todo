use md_todo_backend::create_app;

#[tokio::main]
async fn main() {
    let app = create_app();

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await.unwrap();
    println!("Server running on http://0.0.0.0:8000");

    axum::serve(listener, app).await.unwrap();
}
