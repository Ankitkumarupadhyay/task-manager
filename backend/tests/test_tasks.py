import pytest


def create_task(client, headers, **kwargs):
    data = {
        "title": "Test Task",
        "description": "Description",
        "status": "pending",
        "priority": "medium",
        **kwargs,
    }
    return client.post("/api/tasks", json=data, headers=headers)


def test_create_task(client, admin_headers):
    response = create_task(client, admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["status"] == "pending"
    assert data["priority"] == "medium"


def test_create_task_unauthorized(client):
    response = create_task(client, {})
    assert response.status_code == 401


def test_get_task(client, admin_headers):
    created = create_task(client, admin_headers)
    task_id = created.json()["id"]
    response = client.get(f"/api/tasks/{task_id}", headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id


def test_get_task_not_found(client, admin_headers):
    response = client.get("/api/tasks/99999", headers=admin_headers)
    assert response.status_code == 404


def test_list_tasks_pagination(client, admin_headers):
    for i in range(5):
        create_task(client, admin_headers, title=f"Task {i}")

    response = client.get("/api/tasks?page=1&limit=3", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert len(data["items"]) <= 3


def test_filter_tasks_by_status(client, admin_headers):
    create_task(client, admin_headers, status="pending")
    create_task(client, admin_headers, status="completed")

    response = client.get("/api/tasks?status=pending", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    for task in data["items"]:
        assert task["status"] == "pending"


def test_filter_tasks_by_priority(client, admin_headers):
    create_task(client, admin_headers, priority="high")
    create_task(client, admin_headers, priority="low")

    response = client.get("/api/tasks?priority=high", headers=admin_headers)
    assert response.status_code == 200
    for task in response.json()["items"]:
        assert task["priority"] == "high"


def test_search_tasks(client, admin_headers):
    create_task(client, admin_headers, title="Unique Shopify Integration Task")
    create_task(client, admin_headers, title="Unrelated task")

    response = client.get("/api/tasks?search=Shopify", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert any("Shopify" in t["title"] for t in data["items"])


def test_update_task(client, admin_headers):
    created = create_task(client, admin_headers)
    task_id = created.json()["id"]

    response = client.put(f"/api/tasks/{task_id}", json={"status": "in_progress"}, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"


def test_patch_task(client, admin_headers):
    created = create_task(client, admin_headers)
    task_id = created.json()["id"]

    response = client.patch(f"/api/tasks/{task_id}", json={"priority": "urgent"}, headers=admin_headers)
    assert response.status_code == 200
    assert response.json()["priority"] == "urgent"


def test_delete_task(client, admin_headers):
    created = create_task(client, admin_headers)
    task_id = created.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}", headers=admin_headers)
    assert response.status_code == 204

    response = client.get(f"/api/tasks/{task_id}", headers=admin_headers)
    assert response.status_code == 404


def test_member_cannot_delete_task(client, admin_headers, member_headers):
    created = create_task(client, admin_headers)
    task_id = created.json()["id"]

    response = client.delete(f"/api/tasks/{task_id}", headers=member_headers)
    assert response.status_code == 403


def test_create_task_invalid_status(client, admin_headers):
    response = create_task(client, admin_headers, status="invalid_status")
    assert response.status_code == 422


def test_create_task_empty_title(client, admin_headers):
    response = create_task(client, admin_headers, title="")
    assert response.status_code == 422


def test_task_sorting(client, admin_headers):
    response = client.get("/api/tasks?sort_by=created_at&sort_order=asc", headers=admin_headers)
    assert response.status_code == 200


def test_dashboard(client, admin_headers):
    response = client.get("/api/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "status_breakdown" in data
    assert "priority_breakdown" in data
    assert "recent_tasks" in data
    summary = data["summary"]
    assert "total" in summary
    assert "pending" in summary
    assert "in_progress" in summary
    assert "completed" in summary
    assert "overdue" in summary
