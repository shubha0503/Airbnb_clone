from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Date,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False
    )

    guest_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)

    guests = Column(Integer, nullable=False)
    nights = Column(Integer, nullable=False)

    subtotal = Column(Float, nullable=False)
    cleaning_fee = Column(Float, nullable=False)
    service_fee = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    status = Column(
        String,
        nullable=False,
        default="confirmed"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    listing = relationship(
        "Listing",
        back_populates="bookings"
    )

    guest = relationship(
        "User",
        back_populates="bookings"
    )

    payment_status = Column(String, nullable=False, default="legacy")
    payment_provider = Column(String, nullable=False, default="legacy")
    payment_method = Column(String, nullable=True)
