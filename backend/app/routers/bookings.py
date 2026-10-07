from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.routers.listings import serialize_listing
from app.schemas.booking import BookingResponse

router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("/", status_code=409)
def create_booking():
    raise HTTPException(status_code=409, detail="Bookings are recorded through demo checkout at /api/payments/demo-checkout.")


@router.get("/my-trips/{user_id}")
def get_my_trips(user_id: int, db: Session = Depends(get_db)):
    expired_holds = db.query(Booking).filter(
        Booking.guest_id == user_id,
        Booking.status == "pending_payment",
        Booking.created_at < datetime.utcnow() - timedelta(minutes=30),
    ).all()
    for hold in expired_holds:
        hold.status = "cancelled"
        hold.payment_status = "cancelled"
    if expired_holds:
        db.commit()

    bookings = db.query(Booking).filter(Booking.guest_id == user_id).order_by(Booking.check_in).all()
    return [{
        **{key: value for key, value in booking.__dict__.items() if not key.startswith("_")},
        "listing": serialize_listing(booking.listing).model_dump(),
        "guest": {
            "id": booking.guest.id,
            "name": booking.guest.name,
            "email": booking.guest.email,
            "role": booking.guest.role,
            "avatar_url": booking.guest.avatar_url,
        },
    } for booking in bookings]


@router.get("/listing/{listing_id}", response_model=list[BookingResponse])
def get_listing_bookings(listing_id: int, db: Session = Depends(get_db)):
    return db.query(Booking).filter(Booking.listing_id == listing_id).all()


@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status not in {"confirmed", "pending_payment"}:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    if booking.status == "pending_payment":
        booking.payment_status = "cancelled"
    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully"}


@router.get("/availability/{listing_id}")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    cutoff = datetime.utcnow() - timedelta(minutes=30)
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        (Booking.status == "confirmed") | ((Booking.status == "pending_payment") & (Booking.created_at >= cutoff)),
    ).all()
    return {
        "listing_id": listing_id,
        "unavailable_dates": [{"check_in": booking.check_in, "check_out": booking.check_out} for booking in bookings],
    }
