'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Home, 
  DollarSign, 
  Calendar, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Sparkles,
  Building,
  Users
} from 'lucide-react';
import { Listing, Booking, User } from '@/types';
import Link from 'next/link';
import { api, getCurrentUserId } from '@/services/api';
import toast from 'react-hot-toast';
import { getListingImageUrl, useImageFallback } from '@/lib/images';

const PROPERTY_TYPES = ['House', 'Apartment', 'Guesthouse', 'Hotel', 'Cabin', 'Villa', 'Treehouse'];
const ROOM_TYPES = ['Entire place', 'Private room', 'Shared room'];
const AMENITIES_LIST = ['WiFi', 'Kitchen', 'Air conditioning', 'TV', 'Free parking', 'Pool', 'Washer', 'Heating', 'Workspace', 'Hot tub', 'Balcony', 'Garden', 'Pet friendly', 'Breakfast', 'Beach access'];

export default function HostDashboardPage() {
  const [hostId, setHostId] = useState<number | null>(null);
  const [account, setAccount] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reservations'>('listings');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Beachfront',
    property_type: 'House',
    room_type: 'Entire place',
    instant_book: true,
    self_check_in: false,
    allows_pets: false,
    is_guest_favourite: false,
    is_luxe: false,
    location: '',
    city: '',
    country: '',
    latitude: 34.0522,
    longitude: -118.2437,
    price_per_night: 250,
    cleaning_fee: 50,
    service_fee: 30,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    images: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    amenities: ['WiFi', 'Kitchen', 'Free parking'] as string[],
  });

  const fetchData = async () => {
    if (!hostId) return;
    setLoading(true);
    try {
      const [hostListings, hostRes] = await Promise.all([
        api.getHostListings(hostId),
        api.getHostReservations(hostId),
      ]);
      setListings(hostListings);
      setReservations(hostRes);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load host dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const syncAccount = () => {
      const savedId = getCurrentUserId();
      if (!savedId) { setAccount(null); setHostId(null); setLoading(false); return; }
      api.getUser(savedId).then((user) => {
        setAccount(user);
        setHostId(user.is_host ? user.id : null);
        if (!user.is_host) setLoading(false);
      }).catch(() => { setAccount(null); setHostId(null); setLoading(false); });
    };
    syncAccount();
    window.addEventListener('airbnb-user-change', syncAccount);
    return () => window.removeEventListener('airbnb-user-change', syncAccount);
  }, []);

  useEffect(() => {
    if (hostId) fetchData();
  }, [hostId]);

  const becomeHost = async () => {
    if (!account) return;
    try {
      const host = await api.becomeHost(account.id);
      setAccount(host);
      setHostId(host.id);
      window.dispatchEvent(new Event('airbnb-user-change'));
      toast.success('Your account is ready for hosting.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not activate host tools');
    }
  };

  const openCreateModal = () => {
    setEditingListing(null);
    setFormData({
      title: '',
      description: '',
      category: 'Beachfront',
      property_type: 'House',
      room_type: 'Entire place',
      instant_book: true,
      self_check_in: false,
      allows_pets: false,
      is_guest_favourite: false,
      is_luxe: false,
      location: 'North Goa, Goa, India',
      city: 'Goa',
      country: 'India',
      latitude: 15.2993,
      longitude: 74.124,
      price_per_night: 3500,
      cleaning_fee: 60,
      service_fee: 40,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      images: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80\nhttps://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
      amenities: ['WiFi', 'Kitchen', 'Pool', 'Free parking'],
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (listing: Listing) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      description: listing.description,
      category: listing.property_type,
      property_type: listing.property_type,
      room_type: listing.room_type,
      instant_book: listing.instant_book,
      self_check_in: listing.self_check_in,
      allows_pets: listing.allows_pets,
      is_guest_favourite: listing.is_guest_favourite,
      is_luxe: listing.is_luxe,
      location: listing.location,
      city: listing.city,
      country: listing.country,
      latitude: listing.latitude ?? 0,
      longitude: listing.longitude ?? 0,
      price_per_night: listing.price_per_night,
      cleaning_fee: 0,
      service_fee: listing.service_fee ?? 0,
      max_guests: listing.max_guests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
      images: listing.images.join('\n'),
      amenities: listing.amenities || [],
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteListing = async (listingId: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.deleteListing(listingId, hostId!);
      toast.success('Listing deleted successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Could not delete listing');
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    const imageUrls = formData.images
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const amenities = await api.getAmenities();
      const payload = {
        title: formData.title, description: formData.description, location: formData.location,
        city: formData.city, country: formData.country, property_type: formData.property_type, room_type: formData.room_type,
        instant_book: formData.instant_book, self_check_in: formData.self_check_in, allows_pets: formData.allows_pets,
        is_guest_favourite: formData.is_guest_favourite, is_luxe: formData.is_luxe,
        price_per_night: formData.price_per_night, max_guests: formData.max_guests,
        bedrooms: formData.bedrooms, beds: formData.beds, bathrooms: formData.bathrooms,
        latitude: formData.latitude, longitude: formData.longitude,
        image_urls: imageUrls,
        amenity_ids: amenities.filter((a) => formData.amenities.includes(a.name)).map((a) => a.id),
      };
      if (editingListing) {
        await api.updateListing(editingListing.id, payload, hostId!);
        toast.success('Listing updated!');
      } else {
        await api.createListing(payload, hostId!);
        toast.success('🎉 New listing created successfully!');
      }
      setIsCreateModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save listing');
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity) });
    } else {
      setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
    }
  };

  const totalRevenue = reservations.reduce((acc, r) => acc + (r.payment_status === 'paid' && r.status === 'confirmed' ? r.total_price : 0), 0);

  if (loading && !hostId) {
    return <main className="min-h-[70vh] bg-gray-50 px-4 py-12"><section className="mx-auto max-w-xl animate-pulse rounded-3xl border border-gray-200 bg-white p-8"><div className="h-7 w-48 rounded bg-gray-200"/><div className="mt-4 h-4 w-full rounded bg-gray-100"/><div className="mt-2 h-4 w-2/3 rounded bg-gray-100"/></section></main>;
  }

  if (!loading && !hostId) {
    return (
      <main className="min-h-[70vh] bg-gray-50 px-4 py-12 sm:py-20">
        <section className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-airbnb"><Home size={26} /></div>
          <h1 className="text-2xl font-bold text-gray-900">Your host dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">{account ? 'Switch your account to host mode to publish stays and manage reservations.' : 'Log in to your own account or create one to manage stays as a host.'}</p>
          {account ? <button onClick={becomeHost} className="mt-6 rounded-xl bg-airbnb px-5 py-3 text-sm font-semibold text-white hover:bg-airbnb-dark">Become a host</button> : <div className="mt-6 flex gap-3"><Link href="/login?next=/host" className="rounded-xl bg-airbnb px-5 py-3 text-sm font-semibold text-white">Log in</Link><Link href="/register?next=/host" className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold">Create account</Link></div>}
          <Link href="/" className="mt-6 inline-flex text-sm font-semibold text-gray-700 underline">Return to stays</Link>
        </section>
      </main>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Host Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Host Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your Airbnb properties, pricing, and guest reservations.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-airbnb hover:bg-airbnb-dark text-white font-bold py-3 px-6 rounded-2xl shadow-md transition flex items-center gap-2 text-xs w-fit"
        >
          <Plus size={16} /> Create New Listing
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-rose-50 p-4 rounded-2xl text-airbnb"><Building size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">My Listings</p>
            <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><Users size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Reservations</p>
            <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Host Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-gray-200 mb-6 gap-8 text-sm font-bold">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'listings' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          My Listings ({listings.length})
        </button>
        <button
          onClick={() => setActiveTab('reservations')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'reservations' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          Guest Reservations ({reservations.length})
        </button>
      </div>

      {/* Listings Tab */}
      {activeTab === 'listings' && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-200 rounded-2xl w-full" />)}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200">
              <Home size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No listings created yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                Become a host on Airbnb and start earning income by sharing your home.
              </p>
              <button
                onClick={openCreateModal}
                className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition text-xs"
              >
                Create your first listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((l) => (
                <div key={l.id} className="bg-white border border-gray-200 rounded-3xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-3">
                    <img src={getListingImageUrl(l.images[0], 700)} onError={useImageFallback} alt={l.title} className="w-full h-44 object-cover rounded-2xl" />
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                        <span>{l.category} · {l.property_type}</span>
                        <span>⭐ {l.rating.toFixed(2)}</span>
                      </div>
                      <h3 className="font-bold text-base text-gray-900 truncate">{l.title}</h3>
                      <p className="text-xs text-gray-500">{l.city}, {l.country}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">₹{l.price_per_night.toLocaleString('en-IN')} / night</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(l)}
                      className="flex items-center gap-1 text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100 py-1.5 px-3 rounded-lg transition"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteListing(l.id)}
                      className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:bg-rose-50 py-1.5 px-3 rounded-lg transition"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div>
          {reservations.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-200">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No guest reservations yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                When guests book your stays, their reservations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => {
                const paid = res.payment_status === 'paid' && res.status === 'confirmed';
                const demo = res.payment_status === 'legacy';
                return (
                <div key={res.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-rose-50 text-airbnb p-3 rounded-2xl"><Calendar size={20} /></div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{res.listing?.title || 'Listing'}</h4>
                      <p className="text-xs text-gray-500">Booked by: {res.user?.name || 'Guest'} ({res.user?.email || 'N/A'})</p>
                      <p className="text-xs font-semibold text-gray-800 mt-1">📅 {res.check_in} to {res.check_out} ({res.guests} guests)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Earnings</p>
                    <p className="text-lg font-bold text-gray-900">{paid ? `₹${res.total_price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${paid ? 'text-emerald-700 bg-emerald-50' : 'text-gray-600 bg-gray-100'}`}>{paid ? 'Paid' : res.status === 'cancelled' ? 'Cancelled' : demo ? 'Demo reservation' : res.payment_status.replace('_', ' ')}</span>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Listing Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{editingListing ? 'Edit Listing' : 'Create New Listing'}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} aria-label="Close listing editor" className="p-2 rounded-full hover:bg-gray-100"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 overflow-y-auto space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Malibu Oceanfront Villa"
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Property Type</label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-black font-semibold"
                  >
                    {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your space, atmosphere, and local attractions..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Location string</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Malibu, CA"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Malibu"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Room type</label>
                  <select value={formData.room_type} onChange={(e) => setFormData({ ...formData, room_type: e.target.value })} className="w-full border border-gray-300 rounded-xl p-3 text-xs font-semibold">
                    {ROOM_TYPES.map((room) => <option key={room} value={room}>{room}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {([
                    ['instant_book', 'Instant Book'], ['self_check_in', 'Self check-in'],
                    ['allows_pets', 'Pets allowed'], ['is_guest_favourite', 'Guest favourite'], ['is_luxe', 'Luxe stay'],
                  ] as const).map(([key, label]) => <label key={key} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"><input type="checkbox" checked={formData[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.checked })} />{label}</label>)}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Price / Night (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Beds</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Max Guests</label>
                  <input
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Photo Image URLs (one per line)</label>
                <textarea
                  rows={3}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_LIST.map((amenity) => {
                    const isChecked = formData.amenities.includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className={`p-2 rounded-lg text-left text-xs font-semibold flex items-center justify-between border transition ${
                          isChecked ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'
                        }`}
                      >
                        <span>{amenity}</span>
                        {isChecked && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-airbnb hover:bg-airbnb-dark text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md transition"
                >
                  {editingListing ? 'Update Listing' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
