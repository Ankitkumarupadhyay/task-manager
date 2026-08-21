# TaskFlow — Internal Task & Management Dashboard

TaskFlow is a production-quality full-stack **Internal Task & Management Dashboard** designed for team task tracking, workload monitoring, activity auditing, and team management.

---

## 🌟 Key Features

* **Authentication & Role-Based Access Control (RBAC)**:
  * Secure JWT authentication (Email/Password, bcrypt password hashing).
  * Three permission levels: `Admin`, `Manager`, and `Member`.
  * Member role restrictions (e.g. Members cannot delete tasks or access restricted management actions).

* **Task Management (Full CRUD)**:
  * Create, edit, view, delete tasks with confirmation dialogs.
  * Status tracking: `Pending`, `In Progress`, `Completed`, `Blocked`.
  * Priority tracking: `Low`, `Medium`, `High`, `Urgent`.
  * Assign tasks to team members & set due dates.
  * Inline status toggle on task detail page.

* **Search, Filtering, Sorting & Pagination**:
  * PostgreSQL backend-driven search across task titles and descriptions.
  * Multi-field filtering (Status, Priority, Assignee).
  * Backend sorting by `created_at`, `updated_at`, `due_date`, `priority`, or `title` (Ascending/Descending).
  * URL query parameter state persistence (shareable/bookmarkable URLs).
  * Debounced search input (400ms delay) to minimize backend load.

* **Audit Log & Comments**:
  * Real-time audit activity timeline tracking creation, status updates, priority shifts, assignee changes, and due date updates.
  * Rich discussion section per task with comment creation, user attribution, and comment deletion.

* **Analytics Dashboard**:
  * High-level stat cards (Total Tasks, Pending, In Progress, Completed, Blocked, Overdue, My Tasks).
  * Visual task breakdown using Recharts (Donut chart for Status breakdown, Bar chart for Priority breakdown).
  * Recent activity feed with direct task navigation.

* **External Team Directory Integration**:
  * Backend API proxy (`/api/external/users`) connecting to external API (JSONPlaceholder).
  * High-reliability features: timeout protection (`httpx`), non-2xx error handling, response data trimming, and in-memory TTL caching (60 seconds).

---

## 🏗️ Tech Stack

### Frontend
* **Framework**: React 18 + Vite + TypeScript
* **Styling**: Tailwind CSS + Custom UI Components
* **State & Data Fetching**: TanStack React Query v5
* **Forms & Validation**: React Hook Form + Zod
* **Charts**: Recharts
* **Icons**: Lucide React
* **Router**: React Router v6

### Backend
* **Language & Framework**: Python 3.11+ / FastAPI
* **ORM & Database**: SQLAlchemy 2.x + PostgreSQL
* **Migrations**: Alembic
* **Authentication**: PyJWT + Passlib (bcrypt)
* **HTTP Client**: `httpx` (for external API proxying)
* **Testing**: Pytest + FastAPI TestClient

---

## 📁 Repository Structure

```text
Task Manager/
├── docker-compose.yml       # Docker Compose setup for Postgres, Backend, and Frontend
├── README.md                # Project documentation
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application entrypoint & CORS config
│   │   ├── core/            # Database config, security, auth dependencies
│   │   ├── models/          # SQLAlchemy models (User, Task, Comment, TaskActivity)
│   │   ├── schemas/         # Pydantic validation schemas
│   │   ├── repositories/    # Database query abstractions
│   │   ├── services/        # Core business logic layer
│   │   ├── routes/          # Thin API route handlers
│   │   └── utils/           # Pagination, custom exception handlers, response helpers
│   ├── migrations/          # Alembic migrations directory
│   ├── tests/               # Backend Pytest suite
│   ├── seed.py              # Database seeding script with realistic sample data
│   ├── requirements.txt     # Python backend dependencies
│   ├── alembic.ini          # Alembic configuration
│   └── Dockerfile           # Backend container definition
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Reusable UI primitives (Button, Modal, Input, Badge, etc.)
    │   │   ├── layout/      # App Layout, Header, Sidebar
    │   │   ├── tasks/       # Task Table, Card, Form, Filters, Comments, Activity
    │   │   └── dashboard/   # Stat Cards, Status Chart, Priority Chart, Recent Tasks
    │   ├── pages/           # Dashboard, Tasks, Task Details, Users, Login, NotFound
    │   ├── services/        # Axios API client & service modules
    │   ├── hooks/           # Custom React Query hooks & Auth context
    │   ├── types/           # TypeScript interfaces & types
    │   ├── utils/           # Date formatters, colors, constants
    │   └── routes/          # Protected route guard
    ├── package.json         # Frontend dependencies & scripts
    ├── vite.config.ts       # Vite build configuration & proxy settings
    ├── tailwind.config.js   # Custom Tailwind design tokens
    └── Dockerfile           # Multi-stage Nginx production container
```

---

## ⚡ Quick Start with Docker Compose

Run the entire full-stack application (PostgreSQL, FastAPI Backend, React Frontend) in one command:

```bash
docker-compose up --build
```

Access the application:
* **Frontend Dashboard**: `http://localhost:5173` (or `http://localhost:5173/login`)
* **Backend API Docs (Swagger UI)**: `http://localhost:8000/docs`

---

## 🛠️ Local Development Setup

### 1. Database Setup (PostgreSQL)

Ensure PostgreSQL is running locally, or start PostgreSQL using Docker:

```bash
docker run --name taskmanager_postgres -e POSTGRES_DB=taskmanager -e POSTGRES_USER=taskmanager -e POSTGRES_PASSWORD=taskmanager_secret -p 5432:5432 -d postgres:15-alpine
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Seed database with sample data
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

---

## 🔑 Admin Account (Seeded)

The `seed.py` script populates the application with the initial Admin account:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Ankit Kumar Upadhyay | `ankitupadhyay0811@gmail.com` | `password123` |

---

## 🧪 Running Tests

### Backend Unit & Integration Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

### Frontend Build Verification

```bash
cd frontend
npm run build
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | No |
| `POST` | `/api/auth/login` | Login & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user | Yes |
| `GET` | `/api/tasks` | List tasks (search, filter, sort, paginate) | Yes |
| `POST` | `/api/tasks` | Create a new task | Yes |
| `GET` | `/api/tasks/{id}` | Get task by ID | Yes |
| `PUT` | `/api/tasks/{id}` | Update task details | Yes |
| `DELETE` | `/api/tasks/{id}` | Delete task | Admin / Manager |
| `GET` | `/api/tasks/{id}/comments` | Get comments for task | Yes |
| `POST` | `/api/tasks/{id}/comments` | Add comment to task | Yes |
| `GET` | `/api/tasks/{id}/activity` | Get audit activity timeline | Yes |
| `GET` | `/api/dashboard` | Aggregated dashboard stats & metrics | Yes |
| `GET` | `/api/users` | List users with pagination | Yes |
| `POST` | `/api/users` | Create user | Admin |
| `GET` | `/api/external/users` | External team directory proxy | Yes |
