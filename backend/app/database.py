from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./airbnb.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    if "listings" in inspect(engine).get_table_names():
        listing_columns = {column["name"] for column in inspect(engine).get_columns("listings")}
        listing_migrations = {
            "room_type": "VARCHAR NOT NULL DEFAULT 'Entire place'",
            "instant_book": "BOOLEAN NOT NULL DEFAULT 1",
            "self_check_in": "BOOLEAN NOT NULL DEFAULT 0",
            "allows_pets": "BOOLEAN NOT NULL DEFAULT 0",
            "is_guest_favourite": "BOOLEAN NOT NULL DEFAULT 0",
            "is_luxe": "BOOLEAN NOT NULL DEFAULT 0",
        }
        with engine.begin() as connection:
            for column, definition in listing_migrations.items():
                if column not in listing_columns:
                    connection.execute(text(f"ALTER TABLE listings ADD COLUMN {column} {definition}"))
    if "users" in inspect(engine).get_table_names():
        columns = {column["name"] for column in inspect(engine).get_columns("users")}
        if "password_hash" not in columns:
            with engine.begin() as connection:
                connection.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
