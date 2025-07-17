use axum::{
    body::Body,
    http::{Request, StatusCode},
};
use md_todo_backend::{create_app, ApiResponse, CreateTodoRequest, Todo};
use serde_json::json;
use tower::ServiceExt;

#[tokio::test]
async fn test_health_check() {
    let app = create_app();
    
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
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    assert_eq!(&body[..], b"OK");
}

#[tokio::test]
async fn test_get_todos_empty() {
    let app = create_app();
    
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
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse<Vec<Todo>> = serde_json::from_slice(&body).unwrap();
    
    assert!(api_response.success);
    assert_eq!(api_response.data.unwrap().len(), 0);
}

#[tokio::test]
async fn test_create_todo() {
    let app = create_app();
    
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
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse<Todo> = serde_json::from_slice(&body).unwrap();
    
    assert!(api_response.success);
    let todo = api_response.data.unwrap();
    assert_eq!(todo.title, "Test Todo");
    assert_eq!(todo.content, "Test content");
    assert!(!todo.completed);
}

#[tokio::test]
async fn test_get_todo_not_found() {
    let app = create_app();
    
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
    let app = create_app();
    
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
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse<Todo> = serde_json::from_slice(&body).unwrap();
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
                .method("PUT")
                .header("content-type", "application/json")
                .body(Body::from(serde_json::to_vec(&update_request).unwrap()))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
    
    let body = axum::body::to_bytes(response.into_body(), usize::MAX).await.unwrap();
    let api_response: ApiResponse<Todo> = serde_json::from_slice(&body).unwrap();
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