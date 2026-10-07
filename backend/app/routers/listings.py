from datetime import date, datetime, timedelta
from math import ceil
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.listing_amenity import ListingAmenity
from app.models.user import User
from app.models.amenity import Amenity
from app.models.booking import Booking
from app.models.review import Review

from app.schemas.listing import (
    ListingCreate,
    ListingUpdate,
    ListingResponse,
    PaginatedListingsResponse,
)


router = APIRouter(
    prefix="/api/listings",
    tags=["Listings"],
)


def serialize_listing(listing: Listing) -> ListingResponse:
    """
    Convert SQLAlchemy Listing into the API response
    including rating/review information.
    """

    ratings = [review.rating for review in listing.reviews]

    average_rating = (
        round(sum(ratings) / len(ratings), 2)
        if ratings
        else 0.0
    )

    return ListingResponse(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        location=listing.location,
        city=listing.city,
        country=listing.country,
        price_per_night=listing.price_per_night,
        max_guests=listing.max_guests,
        property_type=listing.property_type,
        room_type=listing.room_type,
        instant_book=listing.instant_book,
        self_check_in=listing.self_check_in,
        allows_pets=listing.allows_pets,
        is_guest_favourite=listing.is_guest_favourite,
        is_luxe=listing.is_luxe,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        bathrooms=listing.bathrooms,
        latitude=listing.latitude,
        longitude=listing.longitude,
        images=listing.images,
        amenities=listing.amenities,
        host=listing.host,
        average_rating=average_rating,
        review_count=len(ratings),
    )


# ============================================================
# GET ALL LISTINGS / SEARCH
# ============================================================

@router.get(
    "/",
    response_model=PaginatedListingsResponse,
)
def get_listings(
    location: Optional[str] = None,
    property_type: Optional[str] = None,

    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),

    guests: Optional[int] = Query(None, ge=1),
    bedrooms: Optional[int] = Query(None, ge=0),
    beds: Optional[int] = Query(None, ge=0),

    amenities: Optional[str] = None,

    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    room_type: Optional[str] = None,
    instant_book: Optional[bool] = None,
    self_check_in: Optional[bool] = None,
    allows_pets: Optional[bool] = None,
    is_guest_favourite: Optional[bool] = None,
    is_luxe: Optional[bool] = None,

    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=100),

    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # Validate prices
    # --------------------------------------------------------

    if (
        min_price is not None
        and max_price is not None
        and min_price > max_price
    ):
        raise HTTPException(
            status_code=400,
            detail="min_price cannot be greater than max_price",
        )

    # --------------------------------------------------------
    # Validate dates
    # --------------------------------------------------------

    if check_in and check_out:

        if check_out <= check_in:
            raise HTTPException(
                status_code=400,
                detail="check_out must be after check_in",
            )

    elif check_in or check_out:

        raise HTTPException(
            status_code=400,
            detail="Both check_in and check_out are required",
        )

    query = db.query(Listing)

    # --------------------------------------------------------
    # Location search
    # --------------------------------------------------------

    if location:

        search = f"%{location.strip()}%"

        query = query.filter(
            Listing.location.ilike(search)
            | Listing.city.ilike(search)
            | Listing.country.ilike(search)
        )

    # --------------------------------------------------------
    # Property type
    # --------------------------------------------------------

    if property_type:

        query = query.filter(
            Listing.property_type.ilike(
                property_type.strip()
            )
        )

    if room_type:
        query = query.filter(Listing.room_type.ilike(room_type.strip()))
    for filter_name, filter_value in (
        ("instant_book", instant_book),
        ("self_check_in", self_check_in),
        ("allows_pets", allows_pets),
        ("is_guest_favourite", is_guest_favourite),
        ("is_luxe", is_luxe),
    ):
        if filter_value is True:
            query = query.filter(getattr(Listing, filter_name).is_(True))

    # --------------------------------------------------------
    # Price
    # --------------------------------------------------------

    if min_price is not None:

        query = query.filter(
            Listing.price_per_night >= min_price
        )

    if max_price is not None:

        query = query.filter(
            Listing.price_per_night <= max_price
        )

    # --------------------------------------------------------
    # Guests
    # --------------------------------------------------------

    if guests is not None:

        query = query.filter(
            Listing.max_guests >= guests
        )

    # --------------------------------------------------------
    # Bedrooms
    # --------------------------------------------------------

    if bedrooms is not None:

        query = query.filter(
            Listing.bedrooms >= bedrooms
        )

    # --------------------------------------------------------
    # Beds
    # --------------------------------------------------------

    if beds is not None:

        query = query.filter(
            Listing.beds >= beds
        )

    # --------------------------------------------------------
    # Amenities
    #
    # Example:
    # ?amenities=WiFi,Kitchen,Pool
    # --------------------------------------------------------

    if amenities:

        requested_amenities = [
            item.strip().lower()
            for item in amenities.split(",")
            if item.strip()
        ]

        for amenity_name in requested_amenities:

            query = query.filter(
                Listing.amenities.any(
                    func.lower(Amenity.name) == amenity_name
                )
            )

    # --------------------------------------------------------
    # Date availability
    #
    # Exclude confirmed bookings and active payment holds from available search results.
    # --------------------------------------------------------

    if check_in and check_out:

        conflicting_listing_ids = (
            db.query(Booking.listing_id)
            .filter(
                (Booking.status == "confirmed")
                | ((Booking.status == "pending_payment") & (Booking.created_at >= datetime.utcnow() - timedelta(minutes=30))),
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .subquery()
        )

        query = query.filter(
            ~Listing.id.in_(conflicting_listing_ids)
        )

    # --------------------------------------------------------
    # Total
    # --------------------------------------------------------

    total = query.count()

    # --------------------------------------------------------
    # Pagination
    # --------------------------------------------------------

    offset = (page - 1) * limit

    listings = (
        query
        .order_by(Listing.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    total_pages = ceil(total / limit) if total else 0

    return {
        "items": [
            serialize_listing(listing)
            for listing in listings
        ],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


# ============================================================
# GET SINGLE LISTING
# ============================================================

@router.get(
    "/{listing_id}",
    response_model=ListingResponse,
)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
):

    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:

        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    return serialize_listing(listing)


# ============================================================
# CREATE LISTING
# ============================================================

@router.post(
    "/",
    response_model=ListingResponse,
    status_code=201,
)
def create_listing(
    listing: ListingCreate,
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

    # Validate amenities

    if listing.amenity_ids:

        existing_amenities = (
            db.query(Amenity.id)
            .filter(
                Amenity.id.in_(listing.amenity_ids)
            )
            .all()
        )

        existing_ids = {
            amenity_id
            for (amenity_id,) in existing_amenities
        }

        invalid_ids = (
            set(listing.amenity_ids)
            - existing_ids
        )

        if invalid_ids:

            raise HTTPException(
                status_code=400,
                detail=f"Invalid amenity IDs: {sorted(invalid_ids)}",
            )

    listing_data = listing.model_dump(
        exclude={
            "image_urls",
            "amenity_ids",
        }
    )

    db_listing = Listing(
        **listing_data,
        host_id=host_id,
    )

    db.add(db_listing)
    db.flush()

    # Images

    for image_url in listing.image_urls:

        if image_url.strip():

            db.add(
                ListingImage(
                    listing_id=db_listing.id,
                    image_url=image_url.strip(),
                )
            )

    # Amenities

    for amenity_id in listing.amenity_ids:

        db.add(
            ListingAmenity(
                listing_id=db_listing.id,
                amenity_id=amenity_id,
            )
        )

    db.commit()
    db.refresh(db_listing)

    return serialize_listing(db_listing)


# ============================================================
# UPDATE LISTING
# ============================================================

@router.put(
    "/{listing_id}",
    response_model=ListingResponse,
)
def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    host_id: Optional[int] = None,
    db: Session = Depends(get_db),
):

    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:

        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    # Optional ownership validation

    if host_id is not None:

        if listing.host_id != host_id:

            raise HTTPException(
                status_code=403,
                detail="You do not own this listing",
            )

    # Validate amenities

    if listing_update.amenity_ids is not None:

        if listing_update.amenity_ids:

            existing_amenities = (
                db.query(Amenity.id)
                .filter(
                    Amenity.id.in_(
                        listing_update.amenity_ids
                    )
                )
                .all()
            )

            existing_ids = {
                amenity_id
                for (amenity_id,) in existing_amenities
            }

            invalid_ids = (
                set(listing_update.amenity_ids)
                - existing_ids
            )

            if invalid_ids:

                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid amenity IDs: {sorted(invalid_ids)}",
                )

    update_data = listing_update.model_dump(
        exclude_unset=True,
        exclude={
            "image_urls",
            "amenity_ids",
        },
    )

    for key, value in update_data.items():

        setattr(listing, key, value)

    # Replace images

    if listing_update.image_urls is not None:

        (
            db.query(ListingImage)
            .filter(
                ListingImage.listing_id == listing_id
            )
            .delete(
                synchronize_session=False
            )
        )

        for image_url in listing_update.image_urls:

            if image_url.strip():

                db.add(
                    ListingImage(
                        listing_id=listing_id,
                        image_url=image_url.strip(),
                    )
                )

    # Replace amenities

    if listing_update.amenity_ids is not None:

        (
            db.query(ListingAmenity)
            .filter(
                ListingAmenity.listing_id == listing_id
            )
            .delete(
                synchronize_session=False
            )
        )

        for amenity_id in listing_update.amenity_ids:

            db.add(
                ListingAmenity(
                    listing_id=listing_id,
                    amenity_id=amenity_id,
                )
            )

    db.commit()
    db.refresh(listing)

    return serialize_listing(listing)


# ============================================================
# DELETE LISTING
# ============================================================

@router.delete("/{listing_id}")
def delete_listing(
    listing_id: int,
    host_id: Optional[int] = None,
    db: Session = Depends(get_db),
):

    listing = (
        db.query(Listing)
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:

        raise HTTPException(
            status_code=404,
            detail="Listing not found",
        )

    if host_id is not None:

        if listing.host_id != host_id:

            raise HTTPException(
                status_code=403,
                detail="You do not own this listing",
            )

    if db.query(Booking).filter(Booking.listing_id == listing_id).first():
        raise HTTPException(status_code=409, detail="This listing has reservation history and cannot be deleted. Update it or remove it from search instead.")

    db.delete(listing)
    db.commit()

    return {
        "message": "Listing deleted successfully",
        "listing_id": listing_id,
    }
