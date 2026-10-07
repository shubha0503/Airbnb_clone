from pydantic import BaseModel
from datetime import date, datetime


class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int


class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    payment_status: str = "legacy"
    payment_provider: str = "legacy"
    payment_method: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
