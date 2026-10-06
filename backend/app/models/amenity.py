from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
    )

    listings = relationship(
        "ListingAmenity",
        back_populates="amenity",
        cascade="all, delete-orphan",
    )