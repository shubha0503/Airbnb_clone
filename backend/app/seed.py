from datetime import date

from app.database import SessionLocal, ensure_schema

from app.models.user import User
from app.models.listing import Listing
from app.models.listing_image import ListingImage
from app.models.amenity import Amenity
from app.models.listing_amenity import ListingAmenity
from app.models.booking import Booking
from app.models.review import Review
from app.models.wishlist import Wishlist


ensure_schema()


def seed_database():

    db = SessionLocal()

    try:

        # --------------------------------------------------
        # CLEAR EXISTING DATA
        # --------------------------------------------------

        db.query(Wishlist).delete()
        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(ListingAmenity).delete()
        db.query(ListingImage).delete()
        db.query(Listing).delete()
        db.query(Amenity).delete()
        db.query(User).delete()

        db.commit()

        # --------------------------------------------------
        # USERS
        # --------------------------------------------------

        hosts = [
            User(
                name="Aarav Sharma",
                email="aarav.host@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=12"
            ),

            User(
                name="Meera Kapoor",
                email="meera.host@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=47"
            ),

            User(
                name="Rohan Verma",
                email="rohan.host@example.com",
                role="host",
                avatar_url="https://i.pravatar.cc/150?img=33"
            )
        ]

        guests = [
            User(
                name="Ashi",
                email="ashi@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=32"
            ),

            User(
                name="Ananya",
                email="ananya@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=44"
            ),

            User(
                name="Rahul",
                email="rahul@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=52"
            ),

            User(
                name="Shubha",
                email="shubha@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=45"
            ),

            User(
                name="Kabir",
                email="kabir@example.com",
                role="guest",
                avatar_url="https://i.pravatar.cc/150?img=68"
            )
        ]

        db.add_all(hosts)
        db.add_all(guests)

        db.commit()

        for user in hosts + guests:
            db.refresh(user)

        # --------------------------------------------------
        # AMENITIES
        # --------------------------------------------------

        amenity_names = [
            "WiFi",
            "Kitchen",
            "Air conditioning",
            "TV",
            "Free parking",
            "Pool",
            "Washer",
            "Heating",
            "Workspace",
            "Hot tub",
            "Balcony",
            "Garden",
            "Pet friendly",
            "Breakfast",
            "Beach access"
        ]

        amenities = []

        for name in amenity_names:

            amenity = Amenity(
                name=name
            )

            db.add(amenity)
            amenities.append(amenity)

        db.commit()

        for amenity in amenities:
            db.refresh(amenity)

        amenity_map = {
            amenity.name: amenity.id
            for amenity in amenities
        }

        # --------------------------------------------------
        # LISTINGS
        # --------------------------------------------------

        listings_data = [

            {
                "host": hosts[0],
                "title": "Luxury Villa with Mountain View",
                "description": "A beautiful mountain villa with spacious rooms, peaceful surroundings and stunning views.",
                "location": "Manali, Himachal Pradesh",
                "city": "Manali",
                "country": "India",
                "price": 4800,
                "guests": 6,
                "type": "Villa",
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 2,
                "lat": 32.2432,
                "lng": 77.1892,
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Heating",
                    "Free parking",
                    "Balcony"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3",
                    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
                ]
            },

            {
                "host": hosts[0],
                "title": "Beach House in Goa",
                "description": "A peaceful beach house close to the sea with a private outdoor space.",
                "location": "Candolim, Goa",
                "city": "Goa",
                "country": "India",
                "price": 6200,
                "guests": 4,
                "type": "House",
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2,
                "lat": 15.517,
                "lng": 73.762,
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "Beach access",
                    "Pool",
                    "Garden"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
                ]
            },

            {
                "host": hosts[1],
                "title": "Heritage Home in Jaipur",
                "description": "Traditional Rajasthani architecture combined with comfortable modern interiors.",
                "location": "Jaipur, Rajasthan",
                "city": "Jaipur",
                "country": "India",
                "price": 3500,
                "guests": 4,
                "type": "Heritage home",
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2,
                "lat": 26.9124,
                "lng": 75.7873,
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "Breakfast",
                    "Garden"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea"
                ]
            },

            {
                "host": hosts[1],
                "title": "Modern Apartment in Delhi",
                "description": "Modern city apartment located close to restaurants, shopping and public transport.",
                "location": "New Delhi, India",
                "city": "Delhi",
                "country": "India",
                "price": 2800,
                "guests": 3,
                "type": "Apartment",
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1,
                "lat": 28.6139,
                "lng": 77.2090,
                "amenities": [
                    "WiFi",
                    "Air conditioning",
                    "TV",
                    "Workspace",
                    "Washer"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
                ]
            },

            {
                "host": hosts[2],
                "title": "Riverside Stay in Rishikesh",
                "description": "Relaxing riverside stay surrounded by nature and close to popular attractions.",
                "location": "Rishikesh, Uttarakhand",
                "city": "Rishikesh",
                "country": "India",
                "price": 3200,
                "guests": 4,
                "type": "Guesthouse",
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2,
                "lat": 30.0869,
                "lng": 78.2676,
                "amenities": [
                    "WiFi",
                    "Garden",
                    "Breakfast",
                    "Balcony",
                    "Free parking"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1540541338287-41700207dee6",
                    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d"
                ]
            },

            {
                "host": hosts[2],
                "title": "Cozy Cabin in Mussoorie",
                "description": "A cozy wooden cabin surrounded by pine trees with beautiful valley views.",
                "location": "Mussoorie, Uttarakhand",
                "city": "Mussoorie",
                "country": "India",
                "price": 4100,
                "guests": 4,
                "type": "Cabin",
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 1,
                "lat": 30.4599,
                "lng": 78.0664,
                "amenities": [
                    "WiFi",
                    "Heating",
                    "Kitchen",
                    "Free parking",
                    "Balcony"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
                    "https://images.unsplash.com/photo-1475855581690-80accde3ae2b",
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739"
                ]
            },

            {
                "host": hosts[0],
                "title": "Lake View Cottage",
                "description": "Quiet cottage overlooking the lake with a private garden and peaceful surroundings.",
                "location": "Nainital, Uttarakhand",
                "city": "Nainital",
                "country": "India",
                "price": 3900,
                "guests": 5,
                "type": "Cottage",
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2,
                "lat": 29.3919,
                "lng": 79.4542,
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Garden",
                    "Balcony",
                    "Heating"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
                    "https://images.unsplash.com/photo-1448630360428-65456885c650",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
                ]
            },

            {
                "host": hosts[1],
                "title": "Peaceful Home in Varanasi",
                "description": "Comfortable home near the ghats, perfect for exploring the culture and history of Varanasi.",
                "location": "Varanasi, Uttar Pradesh",
                "city": "Varanasi",
                "country": "India",
                "price": 2200,
                "guests": 4,
                "type": "Home",
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 1,
                "lat": 25.3176,
                "lng": 82.9739,
                "amenities": [
                    "WiFi",
                    "Kitchen",
                    "Air conditioning",
                    "TV",
                    "Workspace"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
                    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
                    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea"
                ]
            },

            {
                "host": hosts[2],
                "title": "Forest Retreat in Wayanad",
                "description": "A peaceful retreat surrounded by lush greenery and nature.",
                "location": "Wayanad, Kerala",
                "city": "Wayanad",
                "country": "India",
                "price": 4500,
                "guests": 5,
                "type": "Villa",
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2,
                "lat": 11.6854,
                "lng": 76.1320,
                "amenities": [
                    "WiFi",
                    "Pool",
                    "Garden",
                    "Kitchen",
                    "Free parking"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
                    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154",
                    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3"
                ]
            },

            {
                "host": hosts[0],
                "title": "Minimal Studio in Mumbai",
                "description": "Compact modern studio in the heart of Mumbai.",
                "location": "Mumbai, Maharashtra",
                "city": "Mumbai",
                "country": "India",
                "price": 3000,
                "guests": 2,
                "type": "Apartment",
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1,
                "lat": 19.0760,
                "lng": 72.8777,
                "amenities": [
                    "WiFi",
                    "Air conditioning",
                    "TV",
                    "Workspace",
                    "Washer"
                ],
                "images": [
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                    "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85"
                ]
            }
        ]

        created_listings = []

        for data in listings_data:

            listing = Listing(
                host_id=data["host"].id,
                title=data["title"],
                description=data["description"],
                location=data["location"],
                city=data["city"],
                country=data["country"],
                price_per_night=data["price"],
                max_guests=data["guests"],
                property_type=data["type"],
                bedrooms=data["bedrooms"],
                beds=data["beds"],
                bathrooms=data["bathrooms"],
                latitude=data["lat"],
                longitude=data["lng"]
            )

            db.add(listing)
            db.flush()

            created_listings.append(listing)

            # Images
            for image_url in data["images"]:

                image = ListingImage(
                    listing_id=listing.id,
                    image_url=image_url
                )

                db.add(image)

            # Amenities
            for amenity_name in data["amenities"]:

                link = ListingAmenity(
                    listing_id=listing.id,
                    amenity_id=amenity_map[amenity_name]
                )

                db.add(link)

        db.commit()

        # --------------------------------------------------
        # REVIEWS
        # --------------------------------------------------

        review_data = [

            (0, 5.0, "Beautiful property and amazing views. Would definitely stay here again."),
            (0, 4.8, "Very clean and comfortable. The host was extremely helpful."),
            (1, 4.9, "The location was perfect and the beach was very close."),
            (1, 4.7, "Lovely stay and very peaceful."),
            (2, 5.0, "Beautiful heritage property with excellent hospitality."),
            (3, 4.6, "Great apartment and very convenient location."),
            (4, 4.9, "Loved the peaceful surroundings and the river view."),
            (5, 4.8, "The cabin was cozy and the views were incredible."),
            (6, 4.7, "Perfect weekend getaway."),
            (7, 5.0, "Very convenient location and comfortable rooms."),
            (8, 4.9, "Amazing nature retreat."),
            (9, 4.6, "Small but very comfortable studio.")
        ]

        for index, rating, comment in review_data:

            review = Review(
                listing_id=created_listings[index].id,
                user_id=guests[index % len(guests)].id,
                rating=rating,
                comment=comment
            )

            db.add(review)

        # --------------------------------------------------
        # EXISTING BOOKINGS
        # --------------------------------------------------

        bookings = [

            Booking(
                listing_id=created_listings[0].id,
                guest_id=guests[0].id,
                check_in=date(2026, 11, 10),
                check_out=date(2026, 11, 14),
                guests=2,
                nights=4,
                subtotal=19200,
                cleaning_fee=960,
                service_fee=2016,
                total_price=22176,
                status="confirmed"
            ),

            Booking(
                listing_id=created_listings[1].id,
                guest_id=guests[1].id,
                check_in=date(2026, 12, 5),
                check_out=date(2026, 12, 8),
                guests=3,
                nights=3,
                subtotal=18600,
                cleaning_fee=930,
                service_fee=1953,
                total_price=21483,
                status="confirmed"
            ),

            Booking(
                listing_id=created_listings[4].id,
                guest_id=guests[2].id,
                check_in=date(2026, 11, 20),
                check_out=date(2026, 11, 23),
                guests=2,
                nights=3,
                subtotal=9600,
                cleaning_fee=480,
                service_fee=1008,
                total_price=11088,
                status="confirmed"
            )
        ]

        db.add_all(bookings)

        # --------------------------------------------------
        # WISHLISTS
        # --------------------------------------------------

        wishlist_items = [

            Wishlist(
                user_id=guests[0].id,
                listing_id=created_listings[0].id
            ),

            Wishlist(
                user_id=guests[0].id,
                listing_id=created_listings[5].id
            ),

            Wishlist(
                user_id=guests[1].id,
                listing_id=created_listings[1].id
            )
        ]

        db.add_all(wishlist_items)

        db.commit()

        print("\n===================================")
        print("DATABASE SEEDED SUCCESSFULLY")
        print("===================================")
        print(f"Hosts: {len(hosts)}")
        print(f"Guests: {len(guests)}")
        print(f"Amenities: {len(amenities)}")
        print(f"Listings: {len(created_listings)}")
        print("Reviews: 12")
        print("Bookings: 3")
        print("Wishlists: 3")
        print("===================================\n")

    except Exception as e:

        db.rollback()

        print("\nSEEDING FAILED")
        print(e)

        raise

    finally:

        db.close()


if __name__ == "__main__":
    seed_database()
