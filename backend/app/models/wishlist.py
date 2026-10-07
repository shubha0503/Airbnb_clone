from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"
    __table_args__ = (UniqueConstraint("user_id", "listing_id", name="uq_wishlists_user_listing"),)

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
        "Listing",
        back_populates="wishlists",
    )
