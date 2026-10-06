from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    listing_id = Column(
        Integer,
        ForeignKey("listings.id"),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="wishlists"
    )

    listing = relationship(
        "Listing"
    )