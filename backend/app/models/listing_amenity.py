from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False,
    )

    amenity_id = Column(
        Integer,
        ForeignKey("amenities.id"),
        nullable=False,
    )

    listing = relationship(
        "Listing",
        back_populates="amenity_links",
    )

    amenity = relationship(
        "Amenity",
        back_populates="listings",
    )