use axum::{
    extract::Path,
    http::StatusCode,
    response::Json,
    routing::{delete, get, post, put},
    Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

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

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Utc;

    #[test]
    fn test_todo_creation_with_valid_data() {
        let now = Utc::now();
        let todo = Todo {
            id: Uuid::now_v7(),
            title: "Test Todo".to_string(),
            content: "Test content with **markdown**".to_string(),
            completed: false,
            created_at: now,
            updated_at: now,
        };

        assert_eq!(todo.title, "Test Todo");
        assert_eq!(todo.content, "Test content with **markdown**");
        assert_eq!(todo.completed, false);
        assert!(todo.created_at <= Utc::now());
        assert!(todo.updated_at <= Utc::now());
    }

    #[test]
    fn test_todo_validation_empty_title() {
        let result = Todo::validate_title("");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty");
    }

    #[test]
    fn test_todo_validation_title_too_long() {
        let long_title = "a".repeat(256);
        let result = Todo::validate_title(&long_title);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot exceed 255 characters");
    }

    #[test]
    fn test_todo_validation_valid_title() {
        let result = Todo::validate_title("Valid Title");
        assert!(result.is_ok());
    }

    #[test]
    fn test_todo_validation_content_too_long() {
        let long_content = "a".repeat(10001);
        let result = Todo::validate_content(&long_content);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Content cannot exceed 10000 characters");
    }

    #[test]
    fn test_todo_validation_valid_content() {
        let result = Todo::validate_content("Valid markdown content");
        assert!(result.is_ok());
    }

    #[test]
    fn test_todo_validation_empty_content() {
        let result = Todo::validate_content("");
        assert!(result.is_ok());
    }

    #[test]
    fn test_create_todo_request_validation() {
        let valid_request = CreateTodoRequest {
            title: "Valid Title".to_string(),
            content: "Valid content".to_string(),
        };

        let result = valid_request.validate();
        assert!(result.is_ok());
    }

    #[test]
    fn test_create_todo_request_validation_empty_title() {
        let invalid_request = CreateTodoRequest {
            title: "".to_string(),
            content: "Valid content".to_string(),
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_update_todo_request_validation() {
        let valid_request = UpdateTodoRequest {
            title: Some("Updated Title".to_string()),
            content: Some("Updated content".to_string()),
            completed: Some(true),
        };

        let result = valid_request.validate();
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_todo_request_validation_empty_title() {
        let invalid_request = UpdateTodoRequest {
            title: Some("".to_string()),
            content: Some("Valid content".to_string()),
            completed: None,
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
    }

    #[test]
    fn test_todo_new_constructor() {
        let todo = Todo::new("Test Title", "Test Content");
        
        assert_eq!(todo.title, "Test Title");
        assert_eq!(todo.content, "Test Content");
        assert_eq!(todo.completed, false);
        assert!(todo.created_at <= Utc::now());
        assert!(todo.updated_at <= Utc::now());
        assert_eq!(todo.created_at, todo.updated_at);
    }

    #[test]
    fn test_todo_update_content() {
        let mut todo = Todo::new("Original Title", "Original Content");
        let original_created_at = todo.created_at;
        
        std::thread::sleep(std::time::Duration::from_millis(1));
        
        todo.update_content("Updated Content");
        
        assert_eq!(todo.content, "Updated Content");
        assert_eq!(todo.created_at, original_created_at);
        assert!(todo.updated_at > original_created_at);
    }

    #[test]
    fn test_todo_update_title() {
        let mut todo = Todo::new("Original Title", "Original Content");
        let original_created_at = todo.created_at;
        
        std::thread::sleep(std::time::Duration::from_millis(1));
        
        todo.update_title("Updated Title");
        
        assert_eq!(todo.title, "Updated Title");
        assert_eq!(todo.created_at, original_created_at);
        assert!(todo.updated_at > original_created_at);
    }

    #[test]
    fn test_todo_toggle_completed() {
        let mut todo = Todo::new("Test Title", "Test Content");
        let original_created_at = todo.created_at;
        
        assert_eq!(todo.completed, false);
        
        std::thread::sleep(std::time::Duration::from_millis(1));
        
        todo.toggle_completed();
        
        assert_eq!(todo.completed, true);
        assert_eq!(todo.created_at, original_created_at);
        assert!(todo.updated_at > original_created_at);
        
        todo.toggle_completed();
        assert_eq!(todo.completed, false);
    }

    #[test]
    fn test_todo_serialization() {
        let todo = Todo::new("Test Title", "Test Content");
        let json_result = serde_json::to_string(&todo);
        
        assert!(json_result.is_ok());
        let json_string = json_result.unwrap();
        assert!(json_string.contains("Test Title"));
        assert!(json_string.contains("Test Content"));
    }

    #[test]
    fn test_todo_deserialization() {
        let todo_json = r#"
        {
            "id": "018c8f3e-7c4b-7f2a-9b1d-3e4f5a6b7c8d",
            "title": "Test Title",
            "content": "Test Content",
            "completed": false,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        "#;
        
        let result: Result<Todo, _> = serde_json::from_str(todo_json);
        assert!(result.is_ok());
        
        let todo = result.unwrap();
        assert_eq!(todo.title, "Test Title");
        assert_eq!(todo.content, "Test Content");
        assert_eq!(todo.completed, false);
    }

    #[test]
    fn test_api_response_success() {
        let todo = Todo::new("Test", "Content");
        let response = ApiResponse::success(todo.clone());
        
        assert!(response.success);
        assert!(response.data.is_some());
        assert!(response.error.is_none());
        assert_eq!(response.data.unwrap().title, "Test");
    }

    #[test]
    fn test_api_response_error() {
        let response: ApiResponse<Todo> = ApiResponse::error("Test error".to_string());
        
        assert!(!response.success);
        assert!(response.data.is_none());
        assert!(response.error.is_some());
        assert_eq!(response.error.unwrap(), "Test error");
    }

    #[test]
    fn test_todo_validation_whitespace_only_title() {
        let result = Todo::validate_title("   ");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty");
    }

    #[test]
    fn test_todo_validation_title_with_newlines() {
        let result = Todo::validate_title("Title\nwith\nnewlines");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot contain newlines");
    }

    #[test]
    fn test_todo_validation_title_edge_case_255_chars() {
        let title_255 = "a".repeat(255);
        let result = Todo::validate_title(&title_255);
        assert!(result.is_ok());
    }

    #[test]
    fn test_todo_validation_content_edge_case_10000_chars() {
        let content_10000 = "a".repeat(10000);
        let result = Todo::validate_content(&content_10000);
        assert!(result.is_ok());
    }

    #[test]
    fn test_todo_validation_content_with_special_chars() {
        let content_with_special = "Content with special chars: àáâãäåæçèéêë";
        let result = Todo::validate_content(content_with_special);
        assert!(result.is_ok());
    }

    #[test]
    fn test_todo_validation_content_with_emojis() {
        let content_with_emojis = "Content with emojis: 🚀 🎉 📝";
        let result = Todo::validate_content(content_with_emojis);
        assert!(result.is_ok());
    }

    #[test]
    fn test_create_todo_request_validation_title_too_long() {
        let invalid_request = CreateTodoRequest {
            title: "a".repeat(256),
            content: "Valid content".to_string(),
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot exceed 255 characters");
    }

    #[test]
    fn test_create_todo_request_validation_content_too_long() {
        let invalid_request = CreateTodoRequest {
            title: "Valid title".to_string(),
            content: "a".repeat(10001),
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Content cannot exceed 10000 characters");
    }

    #[test]
    fn test_update_todo_request_validation_none_values() {
        let request = UpdateTodoRequest {
            title: None,
            content: None,
            completed: None,
        };

        let result = request.validate();
        assert!(result.is_ok());
    }

    #[test]
    fn test_update_todo_request_validation_title_too_long() {
        let invalid_request = UpdateTodoRequest {
            title: Some("a".repeat(256)),
            content: None,
            completed: None,
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot exceed 255 characters");
    }

    #[test]
    fn test_update_todo_request_validation_content_too_long() {
        let invalid_request = UpdateTodoRequest {
            title: None,
            content: Some("a".repeat(10001)),
            completed: None,
        };

        let result = invalid_request.validate();
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Content cannot exceed 10000 characters");
    }

    #[test]
    fn test_todo_new_constructor_with_validation() {
        let result = Todo::new_with_validation("Valid Title", "Valid Content");
        assert!(result.is_ok());
        
        let todo = result.unwrap();
        assert_eq!(todo.title, "Valid Title");
        assert_eq!(todo.content, "Valid Content");
        assert_eq!(todo.completed, false);
    }

    #[test]
    fn test_todo_new_constructor_with_validation_empty_title() {
        let result = Todo::new_with_validation("", "Valid Content");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty");
    }

    #[test]
    fn test_todo_new_constructor_with_validation_long_title() {
        let result = Todo::new_with_validation(&"a".repeat(256), "Valid Content");
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot exceed 255 characters");
    }

    #[test]
    fn test_todo_update_with_validation() {
        let mut todo = Todo::new("Original Title", "Original Content");
        
        let result = todo.update_with_validation(Some("Updated Title"), Some("Updated Content"), Some(true));
        assert!(result.is_ok());
        
        assert_eq!(todo.title, "Updated Title");
        assert_eq!(todo.content, "Updated Content");
        assert_eq!(todo.completed, true);
    }

    #[test]
    fn test_todo_update_with_validation_empty_title() {
        let mut todo = Todo::new("Original Title", "Original Content");
        
        let result = todo.update_with_validation(Some(""), None, None);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Title cannot be empty");
        
        // Original values should remain unchanged
        assert_eq!(todo.title, "Original Title");
        assert_eq!(todo.content, "Original Content");
    }

    #[test]
    fn test_todo_is_valid() {
        let todo = Todo::new("Valid Title", "Valid Content");
        assert!(todo.is_valid().is_ok());
    }

    #[test]
    fn test_todo_markdown_content_processing() {
        let todo = Todo::new("Test Title", "# Header\n\n**Bold** text with [link](https://example.com)");
        assert!(todo.content.contains("# Header"));
        assert!(todo.content.contains("**Bold**"));
        assert!(todo.content.contains("[link](https://example.com)"));
    }

    #[test]
    fn test_todo_uuid_generation() {
        let todo1 = Todo::new("Title 1", "Content 1");
        let todo2 = Todo::new("Title 2", "Content 2");
        
        assert_ne!(todo1.id, todo2.id);
        assert!(todo1.id.get_version() == Some(uuid::Version::SortRand));
        assert!(todo2.id.get_version() == Some(uuid::Version::SortRand));
    }

    #[test]
    fn test_todo_timestamp_ordering() {
        let todo1 = Todo::new("Title 1", "Content 1");
        std::thread::sleep(std::time::Duration::from_millis(1));
        let todo2 = Todo::new("Title 2", "Content 2");
        
        assert!(todo1.created_at < todo2.created_at);
    }

    #[test]
    fn test_todo_clone() {
        let original = Todo::new("Original Title", "Original Content");
        let cloned = original.clone();
        
        assert_eq!(original.id, cloned.id);
        assert_eq!(original.title, cloned.title);
        assert_eq!(original.content, cloned.content);
        assert_eq!(original.completed, cloned.completed);
        assert_eq!(original.created_at, cloned.created_at);
        assert_eq!(original.updated_at, cloned.updated_at);
    }
}
