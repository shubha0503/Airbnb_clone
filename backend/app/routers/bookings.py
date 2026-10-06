from datetime import date
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.schemas.booking import BookingCreate, BookingResponse
from app.routers.listings import serialize_listing

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings"]
)


@router.post("/", response_model=BookingResponse)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db)
):

    listing = db.query(Listing).filter(
        Listing.id == booking.listing_id
    ).first()

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    if booking.check_in < date.today():
        raise HTTPException(
            status_code=400,
            detail="Check-in date cannot be in the past"
        )

    if booking.check_out <= booking.check_in:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in"
        )

    if booking.guests < 1:
        raise HTTPException(
            status_code=400,
            detail="At least one guest is required"
        )

    if booking.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail="Guest count exceeds listing capacity"
        )

    overlapping_booking = db.query(Booking).filter(
        Booking.listing_id == booking.listing_id,
        (Booking.status == "confirmed")
        | ((Booking.status == "pending_payment") & (Booking.created_at >= datetime.utcnow() - timedelta(minutes=30))),

        Booking.check_in < booking.check_out,
        Booking.check_out > booking.check_in

    ).first()

    if overlapping_booking:
        raise HTTPException(
            status_code=409,
            detail="Selected dates are unavailable"
        )

    nights = (
        booking.check_out - booking.check_in
    ).days

    subtotal = listing.price_per_night * nights

    cleaning_fee = round(subtotal * 0.05, 2)
    service_fee = round(subtotal * 0.10, 2)

    total_price = (
        subtotal
        + cleaning_fee
        + service_fee
    )

    db_booking = Booking(
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=cleaning_fee,
        service_fee=service_fee,
        total_price=total_price,
        status="confirmed"
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return {**{key: value for key, value in db_booking.__dict__.items() if not key.startswith("_")},
            "listing": serialize_listing(listing).model_dump(),
            "guest": None}


@router.get("/my-trips/{user_id}")
def get_my_trips(
    user_id: int,
    db: Session = Depends(get_db)
):

    bookings = db.query(Booking).filter(
        Booking.guest_id == user_id
    ).order_by(
        Booking.check_in
    ).all()
    return [{**{key: value for key, value in booking.__dict__.items() if not key.startswith("_")},
             "listing": serialize_listing(booking.listing).model_dump(),
             "guest": {"id": booking.guest.id, "name": booking.guest.name,
                       "email": booking.guest.email, "role": booking.guest.role,
                       "avatar_url": booking.guest.avatar_url}} for booking in bookings]


@router.get(
    "/listing/{listing_id}",
    response_model=list[BookingResponse]
)
def get_listing_bookings(
    listing_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Booking).filter(
        Booking.listing_id == listing_id
    ).all()


@router.delete("/{booking_id}")
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=400, detail="Booking is already cancelled")
    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully"}


@router.get("/availability/{listing_id}")
def get_availability(
    listing_id: int,
    db: Session = Depends(get_db)
):

    listing = db.query(Listing).filter(
        Listing.id == listing_id
    ).first()

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        (Booking.status == "confirmed") | ((Booking.status == "pending_payment") & (Booking.created_at >= datetime.utcnow() - timedelta(minutes=30)))
    ).all()

    return {
        "listing_id": listing_id,
        "unavailable_dates": [
            {
                "check_in": booking.check_in,
                "check_out": booking.check_out
            }
            for booking in bookings
        ]
    }
