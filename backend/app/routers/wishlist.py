from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.wishlist import Wishlist
from app.models.listing import Listing
from app.models.user import User
from app.schemas.wishlist import (
    WishlistCreate,
    WishlistResponse
)
from app.routers.listings import serialize_listing

router = APIRouter(
    prefix="/api/wishlist",
    tags=["Wishlist"]
)


@router.get("/{user_id}")
def get_wishlist(
    user_id: int,
    db: Session = Depends(get_db)
):

    items = db.query(Wishlist).filter(
        Wishlist.user_id == user_id
    ).all()
    return [{"id": item.id, "user_id": item.user_id, "listing_id": item.listing_id,
             "listing": serialize_listing(item.listing).model_dump()} for item in items]


@router.post("/", response_model=WishlistResponse)
def add_to_wishlist(
    wishlist: WishlistCreate,
    db: Session = Depends(get_db)
):

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == wishlist.user_id,
        Wishlist.listing_id == wishlist.listing_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Listing already in wishlist"
        )

    db_wishlist = Wishlist(
        **wishlist.model_dump()
    )

    db.add(db_wishlist)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="This listing is already in the wishlist")
    db.refresh(db_wishlist)

    return db_wishlist


@router.delete("/{user_id}/{listing_id}")
def remove_from_wishlist(
    user_id: int,
    listing_id: int,
    db: Session = Depends(get_db)
):

    wishlist = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.listing_id == listing_id
    ).first()

    if not wishlist:
        raise HTTPException(
            status_code=404,
            detail="Wishlist item not found"
        )

    db.delete(wishlist)
    db.commit()

    return {
        "message": "Removed from wishlist"
    }


@router.post("/toggle/{user_id}/{listing_id}")
def toggle_wishlist(user_id: int, listing_id: int, db: Session = Depends(get_db)):
    if not db.query(User.id).filter(User.id == user_id).first():
        raise HTTPException(status_code=404, detail="Account not found")
    if not db.query(Listing.id).filter(Listing.id == listing_id).first():
        raise HTTPException(status_code=404, detail="Listing not found")
    item = db.query(Wishlist).filter(Wishlist.user_id == user_id, Wishlist.listing_id == listing_id).first()
    if item:
        db.delete(item)
        db.commit()
        return {"in_wishlist": False}
    db.add(Wishlist(user_id=user_id, listing_id=listing_id))
    try:
        db.commit()
        return {"in_wishlist": True}
    except IntegrityError:
        db.rollback()
        exists = db.query(Wishlist.id).filter(Wishlist.user_id == user_id, Wishlist.listing_id == listing_id).first()
        return {"in_wishlist": bool(exists)}
