use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{delete, get, patch, post},
    Router,
};
use async_trait::async_trait;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Postgres};
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
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

pub type DatabasePool = Pool<Postgres>;

pub async fn create_database_pool(database_url: &str) -> Result<DatabasePool, sqlx::Error> {
    sqlx::PgPool::connect(database_url).await
}

pub type TodoError = Box<dyn std::error::Error + Send + Sync>;

#[async_trait]
pub trait TodoRepositoryTrait: Send + Sync {
    async fn create_todo(&self, todo: &Todo) -> Result<Todo, TodoError>;
    async fn get_all_todos(&self) -> Result<Vec<Todo>, TodoError>;
    async fn get_todo_by_id(&self, id: Uuid) -> Result<Option<Todo>, TodoError>;
    async fn update_todo(&self, id: Uuid, updates: &UpdateTodoRequest) -> Result<Option<Todo>, TodoError>;
    async fn delete_todo(&self, id: Uuid) -> Result<bool, TodoError>;
}

pub struct DatabaseTodoRepository {
    pool: DatabasePool,
}

impl DatabaseTodoRepository {
    pub fn new(pool: DatabasePool) -> Self {
        Self { pool }
    }
}


#[async_trait]
impl TodoRepositoryTrait for DatabaseTodoRepository {
    async fn create_todo(&self, todo: &Todo) -> Result<Todo, TodoError> {
        tracing::debug!("DatabaseTodoRepository: Creating todo with id: {}", todo.id);
        let row = sqlx::query_as::<_, Todo>(
            r#"
            INSERT INTO todos (id, title, content, completed, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, title, content, completed, created_at, updated_at
            "#,
        )
        .bind(todo.id)
        .bind(&todo.title)
        .bind(&todo.content)
        .bind(todo.completed)
        .bind(todo.created_at)
        .bind(todo.updated_at)
        .fetch_one(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("DatabaseTodoRepository: Failed to create todo: {}", e);
            Box::new(e) as TodoError
        })?;

        tracing::debug!("DatabaseTodoRepository: Successfully created todo with id: {}", row.id);
        Ok(row)
    }

    async fn get_all_todos(&self) -> Result<Vec<Todo>, TodoError> {
        tracing::debug!("DatabaseTodoRepository: Fetching all todos");
        let rows = sqlx::query_as::<_, Todo>(
            r#"
            SELECT id, title, content, completed, created_at, updated_at
            FROM todos
            ORDER BY created_at DESC
            "#
        )
        .fetch_all(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("DatabaseTodoRepository: Failed to fetch all todos: {}", e);
            Box::new(e) as TodoError
        })?;

        tracing::debug!("DatabaseTodoRepository: Successfully fetched {} todos", rows.len());
        Ok(rows)
    }

    async fn get_todo_by_id(&self, id: Uuid) -> Result<Option<Todo>, TodoError> {
        tracing::debug!("DatabaseTodoRepository: Fetching todo with id: {}", id);
        let row = sqlx::query_as::<_, Todo>(
            r#"
            SELECT id, title, content, completed, created_at, updated_at
            FROM todos
            WHERE id = $1
            "#,
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("DatabaseTodoRepository: Failed to fetch todo with id {}: {}", id, e);
            Box::new(e) as TodoError
        })?;

        if row.is_some() {
            tracing::debug!("DatabaseTodoRepository: Successfully fetched todo with id: {}", id);
        } else {
            tracing::debug!("DatabaseTodoRepository: Todo not found with id: {}", id);
        }
        Ok(row)
    }

    async fn update_todo(&self, id: Uuid, updates: &UpdateTodoRequest) -> Result<Option<Todo>, TodoError> {
        tracing::debug!("DatabaseTodoRepository: Updating todo with id: {}", id);
        let row = sqlx::query_as::<_, Todo>(
            r#"
            UPDATE todos
            SET title = COALESCE($2, title),
                content = COALESCE($3, content),
                completed = COALESCE($4, completed),
                updated_at = $5
            WHERE id = $1
            RETURNING id, title, content, completed, created_at, updated_at
            "#,
        )
        .bind(id)
        .bind(updates.title.as_ref())
        .bind(updates.content.as_ref())
        .bind(updates.completed)
        .bind(Utc::now())
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("DatabaseTodoRepository: Failed to update todo with id {}: {}", id, e);
            Box::new(e) as TodoError
        })?;

        if row.is_some() {
            tracing::debug!("DatabaseTodoRepository: Successfully updated todo with id: {}", id);
        } else {
            tracing::debug!("DatabaseTodoRepository: Todo not found for update with id: {}", id);
        }
        Ok(row)
    }

    async fn delete_todo(&self, id: Uuid) -> Result<bool, TodoError> {
        tracing::debug!("DatabaseTodoRepository: Deleting todo with id: {}", id);
        let result = sqlx::query(
            r#"
            DELETE FROM todos
            WHERE id = $1
            "#,
        )
        .bind(id)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            tracing::error!("DatabaseTodoRepository: Failed to delete todo with id {}: {}", id, e);
            Box::new(e) as TodoError
        })?;

        let deleted = result.rows_affected() > 0;
        if deleted {
            tracing::debug!("DatabaseTodoRepository: Successfully deleted todo with id: {}", id);
        } else {
            tracing::debug!("DatabaseTodoRepository: Todo not found for deletion with id: {}", id);
        }
        Ok(deleted)
    }
}


pub async fn health_check() -> &'static str {
    "OK"
}

pub async fn get_todos<R: TodoRepositoryTrait>(State(repository): State<Arc<R>>) -> Result<Json<ApiResponse<Vec<Todo>>>, StatusCode> {
    tracing::info!("Getting all todos");
    match repository.get_all_todos().await {
        Ok(todos) => {
            tracing::info!("Successfully retrieved {} todos", todos.len());
            Ok(Json(ApiResponse::success(todos)))
        },
        Err(e) => {
            tracing::error!("Failed to get todos: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        },
    }
}

pub async fn create_todo<R: TodoRepositoryTrait>(
    State(repository): State<Arc<R>>,
    Json(request): Json<CreateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    tracing::info!("Creating new todo with title: '{}'", request.title);
    
    if let Err(e) = request.validate() {
        tracing::warn!("Validation failed for create todo request: {}", e);
        return Err(StatusCode::BAD_REQUEST);
    }

    let todo = Todo::new(&request.title, &request.content);
    
    match repository.create_todo(&todo).await {
        Ok(created_todo) => {
            tracing::info!("Successfully created todo with id: {}", created_todo.id);
            Ok(Json(ApiResponse::success(created_todo)))
        },
        Err(e) => {
            tracing::error!("Failed to create todo: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        },
    }
}

pub async fn get_todo<R: TodoRepositoryTrait>(
    State(repository): State<Arc<R>>,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    tracing::info!("Getting todo with id: {}", id);
    match repository.get_todo_by_id(id).await {
        Ok(Some(todo)) => {
            tracing::info!("Successfully retrieved todo with id: {}", id);
            Ok(Json(ApiResponse::success(todo)))
        },
        Ok(None) => {
            tracing::warn!("Todo not found with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        },
        Err(e) => {
            tracing::error!("Failed to get todo with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        },
    }
}

pub async fn update_todo<R: TodoRepositoryTrait>(
    State(repository): State<Arc<R>>,
    Path(id): Path<Uuid>,
    Json(request): Json<UpdateTodoRequest>,
) -> Result<Json<ApiResponse<Todo>>, StatusCode> {
    tracing::info!("Updating todo with id: {}", id);
    
    if let Err(e) = request.validate() {
        tracing::warn!("Validation failed for update todo request: {}", e);
        return Err(StatusCode::BAD_REQUEST);
    }
    
    match repository.update_todo(id, &request).await {
        Ok(Some(todo)) => {
            tracing::info!("Successfully updated todo with id: {}", id);
            Ok(Json(ApiResponse::success(todo)))
        },
        Ok(None) => {
            tracing::warn!("Todo not found for update with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        },
        Err(e) => {
            tracing::error!("Failed to update todo with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        },
    }
}

pub async fn delete_todo<R: TodoRepositoryTrait>(
    State(repository): State<Arc<R>>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    tracing::info!("Deleting todo with id: {}", id);
    match repository.delete_todo(id).await {
        Ok(true) => {
            tracing::info!("Successfully deleted todo with id: {}", id);
            Ok(StatusCode::NO_CONTENT)
        },
        Ok(false) => {
            tracing::warn!("Todo not found for deletion with id: {}", id);
            Err(StatusCode::NOT_FOUND)
        },
        Err(e) => {
            tracing::error!("Failed to delete todo with id {}: {}", id, e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        },
    }
}


impl Todo {
    pub fn new(title: &str, content: &str) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::now_v7(),
            title: title.to_string(),
            content: content.to_string(),
            completed: false,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn new_with_validation(title: &str, content: &str) -> Result<Self, String> {
        Self::validate_title(title)?;
        Self::validate_content(content)?;
        Ok(Self::new(title, content))
    }

    pub fn validate_title(title: &str) -> Result<(), String> {
        let trimmed = title.trim();
        if trimmed.is_empty() {
            return Err("Title cannot be empty".to_string());
        }
        if title.len() > 255 {
            return Err("Title cannot exceed 255 characters".to_string());
        }
        if title.contains('\n') {
            return Err("Title cannot contain newlines".to_string());
        }
        Ok(())
    }

    pub fn validate_content(content: &str) -> Result<(), String> {
        if content.len() > 10000 {
            return Err("Content cannot exceed 10000 characters".to_string());
        }
        Ok(())
    }

    pub fn is_valid(&self) -> Result<(), String> {
        Self::validate_title(&self.title)?;
        Self::validate_content(&self.content)?;
        Ok(())
    }

    pub fn update_title(&mut self, title: &str) {
        self.title = title.to_string();
        self.updated_at = Utc::now();
    }

    pub fn update_content(&mut self, content: &str) {
        self.content = content.to_string();
        self.updated_at = Utc::now();
    }

    pub fn toggle_completed(&mut self) {
        self.completed = !self.completed;
        self.updated_at = Utc::now();
    }

    pub fn update_with_validation(
        &mut self,
        title: Option<&str>,
        content: Option<&str>,
        completed: Option<bool>,
    ) -> Result<(), String> {
        if let Some(title) = title {
            Self::validate_title(title)?;
        }
        if let Some(content) = content {
            Self::validate_content(content)?;
        }

        if let Some(title) = title {
            self.title = title.to_string();
        }
        if let Some(content) = content {
            self.content = content.to_string();
        }
        if let Some(completed) = completed {
            self.completed = completed;
        }

        self.updated_at = Utc::now();
        Ok(())
    }
}

impl CreateTodoRequest {
    pub fn validate(&self) -> Result<(), String> {
        Todo::validate_title(&self.title)?;
        Todo::validate_content(&self.content)?;
        Ok(())
    }
}

impl UpdateTodoRequest {
    pub fn validate(&self) -> Result<(), String> {
        if let Some(title) = &self.title {
            Todo::validate_title(title)?;
        }
        if let Some(content) = &self.content {
            Todo::validate_content(content)?;
        }
        Ok(())
    }
}

pub fn create_app_with_repository<R: TodoRepositoryTrait + 'static>(repository: Arc<R>) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/api/todos", get(get_todos::<R>))
        .route("/api/todos", post(create_todo::<R>))
        .route("/api/todos/:id", get(get_todo::<R>))
        .route("/api/todos/:id", patch(update_todo::<R>))
        .route("/api/todos/:id", delete(delete_todo::<R>))
        .layer(CorsLayer::permissive())
        .with_state(repository)
}


pub fn create_app_with_database(pool: DatabasePool) -> Router {
    let repository = Arc::new(DatabaseTodoRepository::new(pool));
    create_app_with_repository(repository)
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
