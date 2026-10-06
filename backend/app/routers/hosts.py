from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.listing import Listing
from app.models.booking import Booking
from app.routers.listings import serialize_listing


router = APIRouter(
    prefix="/api/hosts",
    tags=["Hosts"],
)


# ============================================================
# HOST DASHBOARD
# ============================================================

@router.get("/{host_id}/dashboard")
def get_host_dashboard(
    host_id: int,
    db: Session = Depends(get_db),
):

    host = (
        db.query(User)
        .filter(
            User.id == host_id,
            User.role == "host",
        )
        .first()
    )

    if not host:

        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    listings_count = (
        db.query(Listing)
        .filter(Listing.host_id == host_id)
        .count()
    )

    bookings_count = (
        db.query(Booking)
        .join(Listing)
        .filter(Listing.host_id == host_id)
        .count()
    )

    revenue = (
        db.query(Booking.total_price)
        .join(Listing)
        .filter(
            Listing.host_id == host_id,
            Booking.status == "confirmed",
        )
        .all()
    )

    total_revenue = sum(
        amount[0] for amount in revenue
    )

    return {
        "host": {
            "id": host.id,
            "name": host.name,
            "email": host.email,
            "avatar_url": host.avatar_url,
        },
        "stats": {
            "listings": listings_count,
            "bookings": bookings_count,
            "revenue": round(total_revenue, 2),
        },
    }


# ============================================================
# HOST LISTINGS
# ============================================================

@router.get("/{host_id}/listings")
def get_host_listings(
    host_id: int,
    db: Session = Depends(get_db),
):

    host = (
        db.query(User)
        .filter(
            User.id == host_id,
            User.role == "host",
        )
        .first()
    )

    if not host:

        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    listings = (
        db.query(Listing)
        .filter(Listing.host_id == host_id)
        .order_by(Listing.id.desc())
        .all()
    )

    return [serialize_listing(listing).model_dump() for listing in listings]


# ============================================================
# HOST BOOKINGS
# ============================================================

@router.get("/{host_id}/bookings")
def get_host_bookings(
    host_id: int,
    db: Session = Depends(get_db),
):

    host = (
        db.query(User)
        .filter(
            User.id == host_id,
            User.role == "host",
        )
        .first()
    )

    if not host:

        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    bookings = (
        db.query(Booking)
        .join(Listing)
        .filter(Listing.host_id == host_id)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return [{**{key: value for key, value in booking.__dict__.items() if not key.startswith("_")},
             "listing": serialize_listing(booking.listing).model_dump(),
             "guest": {"id": booking.guest.id, "name": booking.guest.name,
                       "email": booking.guest.email, "role": booking.guest.role,
                       "avatar_url": booking.guest.avatar_url}} for booking in bookings]
