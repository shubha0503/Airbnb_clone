from pydantic import BaseModel, Field
from typing import List, Optional


class ListingImageResponse(BaseModel):
    id: int
    image_url: str

    class Config:
        from_attributes = True


class AmenityResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class HostSummary(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ListingBase(BaseModel):
    title: str
    description: str
    location: str
    city: str
    country: str
    price_per_night: float
    max_guests: int
    property_type: str
    room_type: str = "Entire place"
    instant_book: bool = True
    self_check_in: bool = False
    allows_pets: bool = False
    is_guest_favourite: bool = False
    is_luxe: bool = False
    bedrooms: int = 1
    beds: int = 1
    bathrooms: int = 1
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ListingCreate(ListingBase):
    image_urls: List[str] = Field(default_factory=list)
    amenity_ids: List[int] = Field(default_factory=list)


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    instant_book: Optional[bool] = None
    self_check_in: Optional[bool] = None
    allows_pets: Optional[bool] = None
    is_guest_favourite: Optional[bool] = None
    is_luxe: Optional[bool] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_urls: Optional[List[str]] = None
    amenity_ids: Optional[List[int]] = None


class ListingResponse(ListingBase):
    id: int
    host_id: int

    images: List[ListingImageResponse] = Field(default_factory=list)
    amenities: List[AmenityResponse] = Field(default_factory=list)

    host: Optional[HostSummary] = None

    average_rating: float = 0.0
    review_count: int = 0

    class Config:
        from_attributes = True


class PaginatedListingsResponse(BaseModel):
    items: List[ListingResponse]
    total: int
    page: int
    limit: int
    total_pages: int
