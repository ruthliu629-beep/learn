import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Pick database based on DATABASE_URL env var (set on Render/Neon),
# fall back to local SQLite file for development.
_db_url = os.getenv("DATABASE_URL", "").strip()

if _db_url:
    # Neon / many hosts give URLs starting with "postgres://" — SQLAlchemy
    # 1.4+ needs "postgresql://" (or "postgresql+psycopg2://" explicit)
    if _db_url.startswith("postgres://"):
        _db_url = "postgresql://" + _db_url[len("postgres://"):]
    # Enforce SSL for hosted Postgres (Neon etc.)
    if "sslmode=" not in _db_url and _db_url.startswith("postgresql"):
        sep = "&" if "?" in _db_url else "?"
        _db_url = f"{_db_url}{sep}sslmode=require"
    SQLALCHEMY_DATABASE_URL = _db_url
    engine = create_engine(_db_url, pool_pre_ping=True, pool_size=5, max_overflow=10)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(BASE_DIR, "langlearn.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
