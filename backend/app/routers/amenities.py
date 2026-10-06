from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.amenity import Amenity
from app.schemas.listing import AmenityResponse


router = APIRouter(
    prefix="/api/amenities",
    tags=["Amenities"],
)


@router.get(
    "/",
    response_model=list[AmenityResponse],
)
def get_amenities(
    db: Session = Depends(get_db),
):

    return (
        db.query(Amenity)
        .order_by(Amenity.name.asc())
        .all()
    )