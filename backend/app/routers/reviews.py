from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.listing import Listing
from app.schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(
    prefix="/api/reviews",
    tags=["Reviews"]
)


@router.get(
    "/listing/{listing_id}",
    response_model=list[ReviewResponse]
)
def get_reviews(
    listing_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Review).filter(
        Review.listing_id == listing_id
    ).all()


@router.post("/", response_model=ReviewResponse)
def create_review(
    review: ReviewCreate,
    db: Session = Depends(get_db)
):

    listing = db.query(Listing).filter(
        Listing.id == review.listing_id
    ).first()

    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Listing not found"
        )

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=400,
            detail="Rating must be between 1 and 5"
        )

    db_review = Review(
        **review.model_dump()
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review