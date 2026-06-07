from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

# Get the project root directory (parent of backend folder)
project_root = Path(__file__).parent.parent
db_path = project_root / "voice_care.db"
# Use forward slashes for SQLite path
db_path_str = str(db_path.absolute()).replace("\\", "/")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{db_path_str}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False, "timeout": 20},
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
