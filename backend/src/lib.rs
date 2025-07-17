use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{get, post, put, delete},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::RwLock;
use std::sync::Arc;
use uuid::Uuid;
use chrono::{DateTime, Utc};
use tower_http::cors::CorsLayer;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Todo {
    pub id: Uuid,
    pub title: String,
    pub content: String,
    pub completed: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateTodoRequest {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTodoRequest {
    pub title: Option<String>,
    pub content: Option<String>,
    pub completed: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
        }
    }
}

pub type TodoStore = Arc<RwLock<HashMap<Uuid, Todo>>>;

pub async fn health_check() -> &'static str {
    "OK"
}

pub async fn get_todos(store: axum::extract::State<TodoStore>) -> Json<ApiResponse<Vec<Todo>>> {
    let todos = store.read().await;
    let mut todo_list: Vec<Todo> = todos.values().cloned().collect();
    todo_list.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    Json(ApiResponse::success(todo_list))
}

pub async fn create_todo(
    axum::extract::State(store): axum::extract::State<TodoStore>,
    Json(request): Json<CreateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    let now = Utc::now();
    let todo = Todo {
        id: Uuid::now_v7(),
        title: request.title,
        content: request.content,
        completed: false,
        created_at: now,
        updated_at: now,
    };

    let mut todos = store.write().await;
    todos.insert(todo.id, todo.clone());
    
    Ok(Json(ApiResponse::success(todo)))
}

pub async fn get_todo(
    axum::extract::State(store): axum::extract::State<TodoStore>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    let todos = store.read().await;
    
    match todos.get(&id) {
        Some(todo) => Ok(Json(ApiResponse::success(todo.clone()))),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn update_todo(
    axum::extract::State(store): axum::extract::State<TodoStore>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    let mut todos = store.write().await;
    
    match todos.get_mut(&id) {
        Some(todo) => {
            if let Some(title) = request.title {
                todo.title = title;
            }
            if let Some(content) = request.content {
                todo.content = content;
            }
            if let Some(completed) = request.completed {
                todo.completed = completed;
            }
            todo.updated_at = Utc::now();
            
            Ok(Json(ApiResponse::success(todo.clone())))
        }
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub async fn delete_todo(
    axum::extract::State(store): axum::extract::State<TodoStore>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let mut todos = store.write().await;
    
    match todos.remove(&id) {
        Some(_) => Ok(StatusCode::NO_CONTENT),
        None => Err(StatusCode::NOT_FOUND),
    }
}

pub fn create_app() -> Router {
    let store: TodoStore = Arc::new(RwLock::new(HashMap::new()));

    Router::new()
        .route("/health", get(health_check))
        .route("/api/todos", get(get_todos))
        .route("/api/todos", post(create_todo))
        .route("/api/todos/:id", get(get_todo))
        .route("/api/todos/:id", put(update_todo))
        .route("/api/todos/:id", delete(delete_todo))
        .layer(CorsLayer::permissive())
        .with_state(store)
}