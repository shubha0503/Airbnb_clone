import { Booking, Listing, Review, User, SearchFilters, Wishlist } from '@/types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export const getCurrentUserId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const id = Number(window.localStorage.getItem('airbnb-user-id'));
  return Number.isInteger(id) && id > 0 ? id : null;
};

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { ...(options?.body ? { 'Content-Type': 'application/json' } : {}), ...options?.headers },
      cache: 'no-store',
    });
  } catch {
    throw new Error('Could not reach the API. Check that the backend is running and NEXT_PUBLIC_API_URL is correct.');
  }
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (typeof data.detail === 'string') message = data.detail;
      else if (Array.isArray(data.detail)) {
        message = data.detail.map((issue: any) => {
          const field = Array.isArray(issue.loc) ? issue.loc.at(-1) : null;
          const label = typeof field === 'string' && field !== 'body' ? `${field}: ` : '';
          return `${label}${issue.msg || 'Invalid value'}`;
        }).join('. ');
      }
    } catch { /* response may not contain JSON */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

const normalizeUser = (u: any): User => ({ ...u, avatar: u.avatar_url, is_host: u.role === 'host', is_superhost: false });
const normalizeListing = (l: any): Listing => ({
  ...l,
  latitude: l.latitude ?? 0,
  longitude: l.longitude ?? 0,
  images: (l.images || []).map((image: any) => typeof image === 'string' ? image : image.image_url),
  amenities: (l.amenities || []).map((amenity: any) => typeof amenity === 'string' ? amenity : amenity.name),
  rating: l.average_rating ?? l.rating ?? 0,
  review_count: l.review_count ?? 0,
  category: l.property_type,
  room_type: l.room_type ?? 'Entire place',
});
const normalizeBooking = (b: any): Booking => ({ ...b, user_id: b.guest_id, listing: b.listing ? normalizeListing(b.listing) : undefined, user: b.guest ? normalizeUser(b.guest) : undefined });

export const api = {
  register: async (data: {name: string; email: string; password: string; role?: 'guest' | 'host'}) => normalizeUser(await fetchJson<any>('/auth/register', { method: 'POST', body: JSON.stringify({ ...data, name: data.name.trim(), email: data.email.trim().toLowerCase() }) })),
  login: async (data: {email: string; password: string}) => normalizeUser(await fetchJson<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) })),
  becomeHost: async (userId: number) => normalizeUser(await fetchJson<any>(`/auth/become-host/${userId}`, { method: 'POST' })),
  createDemoCheckout: (data: {listing_id: number; guest_id: number; check_in: string; check_out: string; guests: number; payment_method: string}) => fetchJson<{booking_id: number; status: string; payment_status: string; payment_provider: string; total_price: number}>('/payments/demo-checkout', { method: 'POST', body: JSON.stringify(data) }),
  getDemoBooking: (bookingId: number) => fetchJson<{booking_id: number; status: string; payment_status: string; payment_provider: string}>(`/payments/demo-booking/${bookingId}`),
  getAmenities: () => fetchJson<{id: number; name: string}[]>('/amenities/'),
  getUser: async (id: number) => normalizeUser(await fetchJson<any>(`/users/${id}`)),
  getListings: async (filters: SearchFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.location) params.set('location', filters.location);
    if (filters.propertyType) params.set('property_type', filters.propertyType);
    if (filters.roomType) params.set('room_type', filters.roomType);
    if (filters.instantBook) params.set('instant_book', 'true');
    if (filters.selfCheckIn) params.set('self_check_in', 'true');
    if (filters.allowsPets) params.set('allows_pets', 'true');
    if (filters.guestFavourite) params.set('is_guest_favourite', 'true');
    if (filters.luxe) params.set('is_luxe', 'true');
    if (filters.guests) params.set('guests', String(filters.guests));
    if (filters.minPrice !== undefined) params.set('min_price', String(filters.minPrice));
    if (filters.maxPrice !== undefined) params.set('max_price', String(filters.maxPrice));
    if (filters.bedrooms !== undefined) params.set('bedrooms', String(filters.bedrooms));
    if (filters.beds !== undefined) params.set('beds', String(filters.beds));
    if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','));
    if (filters.checkIn) params.set('check_in', filters.checkIn);
    if (filters.checkOut) params.set('check_out', filters.checkOut);
    if (filters.page) params.set('page', String(filters.page));
    params.set('limit', '12');
    const result = await fetchJson<{items: any[]; total: number; page: number; total_pages: number}>(`/listings/?${params}`);
    return { ...result, items: result.items.map(normalizeListing) };
  },
  getListingById: async (id: number) => normalizeListing(await fetchJson<any>(`/listings/${id}`)),
  getAvailability: (listingId: number) => fetchJson<{listing_id: number; unavailable_dates: {check_in: string; check_out: string}[]}>(`/bookings/availability/${listingId}`),
  getHostListings: async (hostId: number) => (await fetchJson<any[]>(`/hosts/${hostId}/listings`)).map(normalizeListing),
  createListing: async (data: Record<string, unknown>, hostId: number) => normalizeListing(await fetchJson<any>(`/listings/?host_id=${hostId}`, { method: 'POST', body: JSON.stringify(data) })),
  updateListing: async (id: number, data: Record<string, unknown>, hostId: number) => normalizeListing(await fetchJson<any>(`/listings/${id}?host_id=${hostId}`, { method: 'PUT', body: JSON.stringify(data) })),
  deleteListing: (id: number, hostId: number) => fetchJson<void>(`/listings/${id}?host_id=${hostId}`, { method: 'DELETE' }),
  getHostReservations: async (hostId: number) => (await fetchJson<any[]>(`/hosts/${hostId}/bookings`)).map(normalizeBooking),
  getUserTrips: async (userId: number) => (await fetchJson<any[]>(`/bookings/my-trips/${userId}`)).map(normalizeBooking),
  cancelBooking: (id: number) => fetchJson<{message: string}>(`/bookings/${id}`, { method: 'DELETE' }),
  getListingReviews: (id: number) => fetchJson<Review[]>(`/reviews/listing/${id}`),
  createReview: (data: {listing_id: number; user_id: number; rating: number; comment: string}) => fetchJson<Review>('/reviews/', { method: 'POST', body: JSON.stringify(data) }),
  getWishlist: async (userId: number) => (await fetchJson<any[]>(`/wishlist/${userId}`)).map((item) => ({ ...item, listing: normalizeListing(item.listing) })),
  toggleWishlist: async (userId: number, listingId: number) => {
    return fetchJson<{in_wishlist: boolean}>(`/wishlist/toggle/${userId}/${listingId}`, { method: 'POST' });
  },
  checkWishlist: async (userId: number, listingId: number) => ({ in_wishlist: (await api.getWishlist(userId)).some((item) => item.listing_id === listingId) }),
};
