from pydantic import BaseModel
from typing import Any, Optional


class WishlistCreate(BaseModel):
    user_id: int
    listing_id: int


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    listing_id: int
    listing: Optional[dict[str, Any]] = None

    class Config:
        from_attributes = True
