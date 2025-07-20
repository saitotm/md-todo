use md_todo_backend::ApiDoc;
use std::fs;
use utoipa::OpenApi;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let openapi = ApiDoc::openapi();
    let json = openapi.to_pretty_json()?;

    fs::write("openapi.json", json)?;
    println!("OpenAPI specification has been written to openapi.json");

    Ok(())
}
