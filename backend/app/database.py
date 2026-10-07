from pathlib import Path

from sqlalchemy import create_engine, event, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_PATH = Path(__file__).resolve().parents[1] / "airbnb.db"
DATABASE_URL = f"sqlite:///{DATABASE_PATH.as_posix()}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(connection, _record):
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

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
    if "bookings" in inspect(engine).get_table_names():
        columns = {column["name"] for column in inspect(engine).get_columns("bookings")}
        booking_migrations = {
            "payment_status": "VARCHAR NOT NULL DEFAULT 'legacy'",
            "payment_provider": "VARCHAR NOT NULL DEFAULT 'legacy'",
            "payment_method": "VARCHAR",
        }
        with engine.begin() as connection:
            for column, definition in booking_migrations.items():
                if column not in columns:
                    connection.execute(text(f"ALTER TABLE bookings ADD COLUMN {column} {definition}"))
    if "wishlists" in inspect(engine).get_table_names():
        with engine.connect() as connection:
            duplicates = connection.execute(text("SELECT 1 FROM wishlists GROUP BY user_id, listing_id HAVING COUNT(*) > 1 LIMIT 1")).first()
        if not duplicates:
            with engine.begin() as connection:
                connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS uq_wishlists_user_listing ON wishlists(user_id, listing_id)"))
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
