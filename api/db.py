# api/db.py
from sqlmodel import SQLModel, create_engine, Session
import os

# local SQLite file in repo root (change path if you prefer)
DB_URL = os.getenv("DB_URL", "sqlite:///./nutrisnap.sqlite")

# check_same_thread=False lets us use one connection in FastAPI
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})

def init_db():
    """Create tables on startup."""
    from .models import Meal  # ensure model is imported
    SQLModel.metadata.create_all(engine)

def get_session():
    """FastAPI dependency that yields a session."""
    with Session(engine) as session:
        yield session
