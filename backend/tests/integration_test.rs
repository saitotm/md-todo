use async_trait::async_trait;
use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use chrono::Utc;
use md_todo_backend::{
    create_app_with_repository, CreateTodoRequest, Todo, TodoError, TodoListResponse,
    TodoRepositoryTrait, TodoResponse, UpdateTodoRequest,
};
use serde_json::json;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower::ServiceExt;
use uuid::Uuid;

// Mock repository for testing
pub struct MockTodoRepository {
    should_fail: Arc<RwLock<bool>>,
    todos: Arc<RwLock<Vec<Todo>>>,
}

impl MockTodoRepository {
    pub fn new() -> Self {
        Self {
            should_fail: Arc::new(RwLock::new(false)),
            todos: Arc::new(RwLock::new(Vec::new())),
        }
    }

    pub async fn set_should_fail(&self, fail: bool) {
        *self.should_fail.write().await = fail;
    }
}

#[async_trait]
impl TodoRepositoryTrait for MockTodoRepository {
    async fn create_todo(&self, todo: &Todo) -> Result<Todo, TodoError> {
        if *self.should_fail.read().await {
            return Err(Box::new(sqlx::Error::RowNotFound) as TodoError);
        }

        let mut todos = self.todos.write().await;
        todos.push(todo.clone());
        Ok(todo.clone())
    }

    async fn get_all_todos(&self) -> Result<Vec<Todo>, TodoError> {
        if *self.should_fail.read().await {
            return Err(Box::new(sqlx::Error::RowNotFound) as TodoError);
        }

        let todos = self.todos.read().await;
        Ok(todos.clone())
    }

    async fn get_todo_by_id(&self, id: Uuid) -> Result<Option<Todo>, TodoError> {
        if *self.should_fail.read().await {
            return Err(Box::new(sqlx::Error::RowNotFound) as TodoError);
        }

        let todos = self.todos.read().await;
        Ok(todos.iter().find(|t| t.id == id).cloned())
    }

    async fn update_todo(
        &self,
        id: Uuid,
        updates: &UpdateTodoRequest,
    ) -> Result<Option<Todo>, TodoError> {
        if *self.should_fail.read().await {
            return Err(Box::new(sqlx::Error::RowNotFound) as TodoError);
        }

        let mut todos = self.todos.write().await;
        if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
            if let Some(title) = &updates.title {
                todo.title = title.clone();
            }
            if let Some(content) = &updates.content {
                todo.content = content.clone();
            }
            if let Some(completed) = updates.completed {
                todo.completed = completed;
            }
            todo.updated_at = Utc::now();
            Ok(Some(todo.clone()))
        } else {
            Ok(None)
        }
    }

    async fn delete_todo(&self, id: Uuid) -> Result<bool, TodoError> {
        if *self.should_fail.read().await {
            return Err(Box::new(sqlx::Error::RowNotFound) as TodoError);
        }

        let mut todos = self.todos.write().await;
        if let Some(pos) = todos.iter().position(|t| t.id == id) {
            todos.remove(pos);
            Ok(true)
        } else {
            Ok(false)
        }
    }
}

// Create test app with MockTodoRepository
fn create_test_app() -> axum::Router {
    let mock_repo = Arc::new(MockTodoRepository::new());
    create_app_with_repository(mock_repo)
}

#[tokio::test]
async fn test_health_check() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/health")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    assert_eq!(&body[..], b"OK");
}

#[tokio::test]
async fn test_get_todos_empty() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let api_response: TodoListResponse = serde_json::from_slice(&body).unwrap();

    assert!(api_response.success);
    assert_eq!(api_response.data.unwrap().len(), 0);
}

#[tokio::test]
async fn test_create_todo() {
    let app = create_test_app();

    let create_request = CreateTodoRequest {
        title: "Test Todo".to_string(),
        content: "Test content".to_string(),
    };

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .method("POST")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_vec(&create_request).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let api_response: TodoResponse = serde_json::from_slice(&body).unwrap();

    assert!(api_response.success);
    let todo = api_response.data.unwrap();
    assert_eq!(todo.title, "Test Todo");
    assert_eq!(todo.content, "Test content");
    assert!(!todo.completed);
}

#[tokio::test]
async fn test_get_todo_not_found() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/todos/018c8f3e-7c4b-7f2a-9b1d-3e4f5a6b7c8d")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_crud_operations() {
    let app = create_test_app();

    // Create a todo
    let create_request = CreateTodoRequest {
        title: "CRUD Test".to_string(),
        content: "Testing CRUD operations".to_string(),
    };

    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .method("POST")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_vec(&create_request).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let api_response: TodoResponse = serde_json::from_slice(&body).unwrap();
    let todo = api_response.data.unwrap();
    let todo_id = todo.id;

    // Get the todo
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri(&format!("/api/todos/{}", todo_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // Update the todo
    let update_request = json!({
        "title": "Updated CRUD Test",
        "completed": true
    });

    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri(&format!("/api/todos/{}", todo_id))
                .method("PATCH")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_vec(&update_request).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let api_response: TodoResponse = serde_json::from_slice(&body).unwrap();
    let updated_todo = api_response.data.unwrap();

    assert_eq!(updated_todo.title, "Updated CRUD Test");
    assert!(updated_todo.completed);

    // Delete the todo
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri(&format!("/api/todos/{}", todo_id))
                .method("DELETE")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NO_CONTENT);

    // Verify it's deleted
    let response = app
        .oneshot(
            Request::builder()
                .uri(&format!("/api/todos/{}", todo_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_database_error_handling() {
    let mock_repo = Arc::new(MockTodoRepository::new());
    mock_repo.set_should_fail(true).await;

    let app = create_app_with_repository(mock_repo);

    // Test that database errors return 500
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::INTERNAL_SERVER_ERROR);
}

#[tokio::test]
async fn test_validation_error_handling() {
    let app = create_test_app();

    // Test empty title validation
    let invalid_request = CreateTodoRequest {
        title: "".to_string(),
        content: "Valid content".to_string(),
    };

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/todos")
                .method("POST")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_vec(&invalid_request).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn test_swagger_ui_endpoint() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/swagger-ui")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // Swagger UI returns a redirect to the actual UI page
    assert!(response.status() == StatusCode::OK || response.status() == StatusCode::SEE_OTHER);
}

#[tokio::test]
async fn test_openapi_json_endpoint() {
    let app = create_test_app();

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api-docs/openapi.json")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let content_type = response.headers().get("content-type");
    assert!(content_type.is_some());
    assert!(content_type
        .unwrap()
        .to_str()
        .unwrap()
        .contains("application/json"));
}
