import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db

# SQLite in-memory database for tests with StaticPool so memory DB is shared across threads
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def test_admin(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Admin",
            "email": "admin@test.com",
            "password": "password123",
            "role": "admin",
        },
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def test_member(client):
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test Member",
            "email": "member@test.com",
            "password": "password123",
            "role": "member",
        },
    )
    assert response.status_code == 201
    return response.json()


@pytest.fixture
def admin_token(client, test_admin):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "admin@test.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def member_token(client, test_member):
    response = client.post(
        "/api/auth/login",
        json={
            "email": "member@test.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def member_headers(member_token):
    return {"Authorization": f"Bearer {member_token}"}
