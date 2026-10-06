from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    role = Column(String, nullable=False, default="guest")
    avatar_url = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)

    listings = relationship(
        "Listing",
        back_populates="host",
        cascade="all, delete-orphan"
    )

    bookings = relationship(
        "Booking",
        back_populates="guest",
        cascade="all, delete-orphan"
    )

    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    wishlists = relationship(
        "Wishlist",
        back_populates="user",
        cascade="all, delete-orphan"
    )
