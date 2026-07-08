from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

# SQLite needs the parent directory to exist and a single-thread guard for
# FastAPI's threadpool; other backends (e.g. PostgreSQL) need neither.
connect_args: dict[str, object] = {}
if settings.is_sqlite:
    db_file = settings.DATABASE_URL.replace("sqlite:///", "", 1)
    Path(db_file).parent.mkdir(parents=True, exist_ok=True)
    connect_args["check_same_thread"] = False

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
