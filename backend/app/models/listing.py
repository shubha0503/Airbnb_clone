from sqlalchemy import (
    Column,
    Boolean,
    Integer,
    String,
    Float,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Listing(Base):
    __tablename__ = "listings"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    host_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    title = Column(
        String,
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    location = Column(
        String,
        nullable=False,
    )

    city = Column(
        String,
        nullable=False,
    )

    country = Column(
        String,
        nullable=False,
    )

    price_per_night = Column(
        Float,
        nullable=False,
    )

    max_guests = Column(
        Integer,
        nullable=False,
    )

    property_type = Column(
        String,
        nullable=False,
    )

    room_type = Column(String, nullable=False, default="Entire place")
    instant_book = Column(Boolean, nullable=False, default=True)
    self_check_in = Column(Boolean, nullable=False, default=False)
    allows_pets = Column(Boolean, nullable=False, default=False)
    is_guest_favourite = Column(Boolean, nullable=False, default=False)
    is_luxe = Column(Boolean, nullable=False, default=False)

    bedrooms = Column(
        Integer,
        nullable=False,
        default=1,
    )

    beds = Column(
        Integer,
        nullable=False,
        default=1,
    )

    bathrooms = Column(
        Integer,
        nullable=False,
        default=1,
    )

    latitude = Column(
        Float,
        nullable=True,
    )

    longitude = Column(
        Float,
        nullable=True,
    )

    # ========================================================
    # HOST
    # ========================================================

    host = relationship(
        "User",
        back_populates="listings",
    )

    # ========================================================
    # IMAGES
    # ========================================================

    images = relationship(
        "ListingImage",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # BOOKINGS
    # ========================================================

    bookings = relationship(
        "Booking",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # REVIEWS
    # ========================================================

    reviews = relationship(
        "Review",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # AMENITY ASSOCIATION ROWS
    # ========================================================

    amenity_links = relationship(
        "ListingAmenity",
        back_populates="listing",
        cascade="all, delete-orphan",
    )

    # ========================================================
    # DIRECT AMENITIES
    # ========================================================

    amenities = relationship(
        "Amenity",
        secondary="listing_amenities",
        viewonly=True,
    )

    wishlists = relationship(
        "Wishlist",
        back_populates="listing",
        cascade="all, delete-orphan",
    )
