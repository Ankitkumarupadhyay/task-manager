"""
Seed script: Populates database with initial Admin user and initial workspace tasks.

Admin Account:
    Name: Ankit Kumar Upadhyay
    Email: ankitupadhyay0811@gmail.com
    Password: password123
"""

import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User
from app.models.task import Task
from app.models.comment import Comment
from app.models.activity import TaskActivity


def seed():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database...")

        # ── Admin User ──────────────────────────────────────────────────────
        admin_user = User(
            name="Ankit Kumar Upadhyay",
            email="ankitupadhyay0811@gmail.com",
            password_hash=hash_password("password123"),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print(f"Created Admin user: {admin_user.name} ({admin_user.email})")

        # ── Sample Tasks ────────────────────────────────────────────────────
        today = date.today()

        tasks_data = [
            {
                "title": "Welcome to TaskFlow Dashboard",
                "description": "Explore team tasks, assign work, set due dates, track activities, and manage user roles.",
                "status": "in_progress",
                "priority": "high",
                "due": today + timedelta(days=3),
            },
            {
                "title": "Set up project team members",
                "description": "Add team members and assign roles under the Users directory.",
                "status": "pending",
                "priority": "medium",
                "due": today + timedelta(days=7),
            },
            {
                "title": "System Initialization Completed",
                "description": "PostgreSQL database tables created and initial Admin account configured.",
                "status": "completed",
                "priority": "urgent",
                "due": today - timedelta(days=1),
            },
        ]

        tasks = []
        for t_data in tasks_data:
            task = Task(
                title=t_data["title"],
                description=t_data["description"],
                status=t_data["status"],
                priority=t_data["priority"],
                assigned_to=admin_user.id,
                created_by=admin_user.id,
                due_date=t_data["due"],
            )
            db.add(task)
            tasks.append(task)

        db.commit()
        for t in tasks:
            db.refresh(t)

        print(f"Created {len(tasks)} initial tasks.")

        # ── Initial Activity & Comment ──────────────────────────────────────
        activity = TaskActivity(
            task_id=tasks[0].id,
            user_id=admin_user.id,
            action="task_created",
            new_value=tasks[0].title,
        )
        db.add(activity)

        comment = Comment(
            task_id=tasks[0].id,
            user_id=admin_user.id,
            comment="Initial admin workspace created successfully.",
        )
        db.add(comment)

        db.commit()

        print("\n✅ Database seeded successfully!")
        print(f"   Role:      ADMIN")
        print(f"   Name:      Ankit Kumar Upadhyay")
        print(f"   Email:     ankitupadhyay0811@gmail.com")
        print(f"   Password:  password123\n")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
