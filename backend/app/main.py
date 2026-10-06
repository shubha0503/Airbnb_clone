from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import ensure_schema
from app.config import load_backend_env

load_backend_env()

import app.models

from app.routers import (
    users,
    listings,
    bookings,
    reviews,
    wishlist,
    amenities,
    hosts,
    auth,
    payments,
)


ensure_schema()


app = FastAPI(
    title="Airbnb Clone API",
    description="REST API for Airbnb Clone SDE Assignment",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(users.router)
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(wishlist.router)
app.include_router(amenities.router)
app.include_router(hosts.router)
app.include_router(auth.router)
app.include_router(payments.router)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/", tags=["Health"])
def root():

    return {
        "message": "Airbnb Clone API is running",
        "status": "healthy",
    }
