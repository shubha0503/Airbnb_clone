from pydantic import BaseModel
from datetime import datetime


class ReviewCreate(BaseModel):
    listing_id: int
    user_id: int
    rating: float
    comment: str


class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: float
    comment: str
    created_at: datetime

    class Config:
        from_attributes = True