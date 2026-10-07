from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.models.user import User

router = APIRouter(prefix="/api/payments", tags=["Demo payments"])


class DemoCheckoutRequest(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)
    payment_method: str = Field(default="card", pattern="^(card|upi)$")


@router.post("/demo-checkout")
def demo_checkout(payload: DemoCheckoutRequest, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    guest = db.query(User).filter(User.id == payload.guest_id).first()
    if not listing or not guest:
        raise HTTPException(status_code=404, detail="Listing or guest account not found")
    if guest.role != "guest":
        raise HTTPException(status_code=403, detail="Only a guest account can book a stay")
    if payload.check_in < date.today() or payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Choose valid future check-in and check-out dates")
    if payload.guests > listing.max_guests:
        raise HTTPException(status_code=400, detail=f"Guest count must be between 1 and {listing.max_guests}")
    overlap = db.query(Booking).filter(
        Booking.listing_id == listing.id,
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in,
        Booking.status.in_(["confirmed", "pending_payment"]),
    ).first()
    if overlap:
        raise HTTPException(status_code=409, detail="Those dates are unavailable. Choose different dates.")

    nights = (payload.check_out - payload.check_in).days
    subtotal = round(listing.price_per_night * nights, 2)
    cleaning_fee = round(subtotal * 0.05, 2)
    service_fee = round(subtotal * 0.10, 2)
    booking = Booking(
        listing_id=listing.id, guest_id=guest.id, check_in=payload.check_in,
        check_out=payload.check_out, guests=payload.guests, nights=nights,
        subtotal=subtotal, cleaning_fee=cleaning_fee, service_fee=service_fee,
        total_price=round(subtotal + cleaning_fee + service_fee, 2),
        status="confirmed", payment_status="paid", payment_provider="demo", payment_method=payload.payment_method,
    )
    db.add(booking)
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not confirm this booking. Please check availability and try again.")
    db.refresh(booking)
    return {"booking_id": booking.id, "status": booking.status, "payment_status": booking.payment_status,
            "payment_provider": booking.payment_provider, "payment_method": booking.payment_method,
            "total_price": booking.total_price}


@router.get("/demo-booking/{booking_id}")
def get_demo_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(
        Booking.id == booking_id, Booking.payment_provider == "demo",
        Booking.payment_status == "paid", Booking.status == "confirmed",
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Paid demo booking not found")
    return {"booking_id": booking.id, "status": booking.status,
            "payment_status": booking.payment_status, "payment_provider": booking.payment_provider,
            "payment_method": booking.payment_method}
