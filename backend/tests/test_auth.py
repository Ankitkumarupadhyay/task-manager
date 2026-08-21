import pytest


def test_register_success(client):
    response = client.post("/api/auth/register", json={
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",
        "role": "member",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["name"] == "John Doe"
    assert data["role"] == "member"
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    client.post("/api/auth/register", json={
        "name": "User One",
        "email": "dup@example.com",
        "password": "pass123",
        "role": "member",
    })
    response = client.post("/api/auth/register", json={
        "name": "User Two",
        "email": "dup@example.com",
        "password": "pass456",
        "role": "member",
    })
    assert response.status_code == 409


def test_login_success(client):
    client.post("/api/auth/register", json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "mypassword",
        "role": "member",
    })
    response = client.post("/api/auth/login", json={
        "email": "login@example.com",
        "password": "mypassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "wrongpass",
    })
    assert response.status_code == 401


def test_get_me(client, admin_headers):
    response = client.get("/api/auth/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@test.com"


def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
