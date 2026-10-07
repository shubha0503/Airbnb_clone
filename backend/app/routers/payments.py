import hashlib
import hmac
import json
import os
import time
from datetime import date, datetime, timedelta
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import APIRouter, Depends, Header, HTTPException, Request as FastAPIRequest
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.listing import Listing
from app.models.user import User

router = APIRouter(prefix="/api/payments", tags=["Payments"])
STRIPE_API = "https://api.stripe.com/v1"


class CheckoutRequest(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int


def stripe_request(path: str, secret: str, fields: dict[str, str] | None = None) -> dict:
    body = urlencode(fields or {}).encode() if fields is not None else None
    request = Request(
        f"{STRIPE_API}{path}", data=body,
        headers={"Authorization": f"Bearer {secret}", **({"Content-Type": "application/x-www-form-urlencoded"} if body else {})},
        method="POST" if body is not None else "GET",
    )
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read())
    except HTTPError as error:
        detail = error.read().decode(errors="replace")
        try:
            detail = json.loads(detail).get("error", {}).get("message", detail)
        except ValueError:
            pass
        raise HTTPException(status_code=502, detail=f"Stripe could not process checkout: {detail[:300]}") from error
    except (URLError, TimeoutError) as error:
        raise HTTPException(status_code=502, detail="Could not connect to Stripe. Please try again.") from error


def _set_session_status(session: dict, db: Session) -> Booking | None:
    booking_id = (session.get("metadata") or {}).get("booking_id")
    if not booking_id:
        return None
    try:
        booking = db.query(Booking).filter(Booking.id == int(booking_id)).first()
    except (TypeError, ValueError):
        return None
    if not booking:
        return None
    session_id = session.get("id")
    if booking.stripe_session_id and session_id != booking.stripe_session_id:
        return None
    amount_matches = session.get("amount_total") == round(booking.total_price * 100)
    currency_matches = (session.get("currency") or "").lower() == "inr"
    intent = session.get("payment_intent")
    if session.get("payment_status") == "paid" and amount_matches and currency_matches:
        booking.status = "confirmed"
        booking.payment_status = "paid"
        booking.stripe_session_id = booking.stripe_session_id or session_id
        booking.stripe_payment_intent_id = intent.get("id") if isinstance(intent, dict) else intent
        db.commit()
    elif booking.status == "pending_payment" and (session.get("status") == "expired" or session.get("payment_status") == "unpaid" and session.get("status") == "complete"):
        booking.status = "cancelled"
        booking.payment_status = "cancelled"
        db.commit()
    return booking


@router.post("/checkout")
def create_checkout(payload: CheckoutRequest, request: FastAPIRequest, db: Session = Depends(get_db)):
    secret = os.getenv("STRIPE_SECRET_KEY", "")
    if not secret.startswith("sk_test_"):
        raise HTTPException(status_code=503, detail="Stripe test mode is not configured. Add STRIPE_SECRET_KEY=sk_test_… to backend/.env and restart the API.")
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    guest = db.query(User).filter(User.id == payload.guest_id).first()
    if not listing or not guest:
        raise HTTPException(status_code=404, detail="Listing or guest account not found")
    today = date.today()
    if payload.check_in < today or payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Choose valid future check-in and check-out dates")
    if not 1 <= payload.guests <= listing.max_guests:
        raise HTTPException(status_code=400, detail=f"Guest count must be between 1 and {listing.max_guests}")
    cutoff = datetime.utcnow() - timedelta(minutes=30)
    overlap = db.query(Booking).filter(
        Booking.listing_id == listing.id,
        Booking.check_in < payload.check_out,
        Booking.check_out > payload.check_in,
        (Booking.status == "confirmed") | ((Booking.status == "pending_payment") & (Booking.created_at >= cutoff)),
    ).first()
    if overlap:
        raise HTTPException(status_code=409, detail="Those dates are unavailable. Choose different dates.")

    nights = (payload.check_out - payload.check_in).days
    subtotal = round(listing.price_per_night * nights, 2)
    cleaning_fee = round(subtotal * 0.05, 2)
    service_fee = round(subtotal * 0.10, 2)
    total = round(subtotal + cleaning_fee + service_fee, 2)
    booking = Booking(
        listing_id=listing.id, guest_id=guest.id, check_in=payload.check_in, check_out=payload.check_out,
        guests=payload.guests, nights=nights, subtotal=subtotal, cleaning_fee=cleaning_fee,
        service_fee=service_fee, total_price=total, status="pending_payment", payment_status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    origin = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    cancel_query = urlencode({
        "booking_id": booking.id,
        "listing_id": listing.id,
        "checkIn": payload.check_in.isoformat(),
        "checkOut": payload.check_out.isoformat(),
        "guests": payload.guests,
    })
    try:
        session = stripe_request("/checkout/sessions", secret, {
            "mode": "payment", "success_url": f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{origin}/payment/cancelled?{cancel_query}",
            "expires_at": str(int(time.time()) + 30 * 60),
            "customer_email": guest.email, "client_reference_id": str(booking.id),
            "metadata[booking_id]": str(booking.id),
            "line_items[0][price_data][currency]": "inr",
            "line_items[0][price_data][unit_amount]": str(round(total * 100)),
            "line_items[0][price_data][product_data][name]": f"{listing.title} · {nights} night{'s' if nights != 1 else ''}",
            "line_items[0][price_data][product_data][description]": f"{payload.check_in.isoformat()} to {payload.check_out.isoformat()} · {payload.guests} guest{'s' if payload.guests != 1 else ''}",
            "line_items[0][quantity]": "1",
        })
        if not session.get("url"):
            raise HTTPException(status_code=502, detail="Stripe did not return a checkout URL")
        booking.stripe_session_id = session["id"]
        db.commit()
        return {"checkout_url": session["url"], "session_id": session["id"], "booking_id": booking.id}
    except Exception:
        db.delete(booking)
        db.commit()
        raise


@router.get("/session/{session_id}")
def check_checkout(session_id: str, db: Session = Depends(get_db)):
    secret = os.getenv("STRIPE_SECRET_KEY", "")
    if not secret.startswith("sk_test_"):
        raise HTTPException(status_code=503, detail="Stripe test mode is not configured")
    if not session_id.startswith("cs_test_"):
        raise HTTPException(status_code=400, detail="Invalid test Checkout Session ID")
    session = stripe_request(f"/checkout/sessions/{session_id}", secret)
    booking = _set_session_status(session, db)
    return {"paid": bool(booking and booking.payment_status == "paid"), "booking_id": booking.id if booking else None, "status": booking.status if booking else "unknown", "payment_status": booking.payment_status if booking else "unknown"}


@router.post("/cancel/{booking_id}")
def cancel_pending_checkout(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status == "pending_payment":
        secret = os.getenv("STRIPE_SECRET_KEY", "")
        if secret.startswith("sk_test_") and booking.stripe_session_id:
            session = stripe_request(f"/checkout/sessions/{booking.stripe_session_id}", secret)
            _set_session_status(session, db)
            if booking.payment_status == "paid":
                return {"status": booking.status, "payment_status": booking.payment_status}
            if session.get("status") == "open":
                stripe_request(f"/checkout/sessions/{booking.stripe_session_id}/expire", secret, {})
        booking.status = "cancelled"
        booking.payment_status = "cancelled"
        db.commit()
    return {"status": booking.status, "payment_status": booking.payment_status}


@router.post("/webhook")
async def stripe_webhook(request: FastAPIRequest, stripe_signature: str | None = Header(default=None), db: Session = Depends(get_db)):
    secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    if not secret or not stripe_signature:
        raise HTTPException(status_code=400, detail="Webhook signature is not configured")
    raw = await request.body()
    parts = dict(part.split("=", 1) for part in stripe_signature.split(",") if "=" in part)
    timestamp, signature = parts.get("t", ""), parts.get("v1", "")
    signed_payload = timestamp.encode() + b"." + raw
    expected = hmac.new(secret.encode(), signed_payload, hashlib.sha256).hexdigest()
    if not timestamp.isdigit() or abs(time.time() - int(timestamp)) > 300 or not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")
    event = json.loads(raw)
    if event.get("type", "").startswith("checkout.session."):
        _set_session_status(event.get("data", {}).get("object", {}), db)
    return {"received": True}
