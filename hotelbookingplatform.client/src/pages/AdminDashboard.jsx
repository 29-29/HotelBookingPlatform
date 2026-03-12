import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Hotel, Bed, BookOpen, TrendingUp, PlusCircle, Trash2, Edit3,
    Eye, ChevronRight, LayoutDashboard, Users, LogOut, X, Save,
} from 'lucide-react';
import { getAllBookings } from '../services/bookingService';
import { getHotels, createHotel, updateHotel, deleteHotel } from '../services/hotelService';
import useAuthStore from '../stores/useAuthStore';
import './AdminDashboard.css';

const STATUS_COLORS = {
    Confirmed: 'status-confirmed', Pending: 'status-pending',
    Completed: 'status-completed', Cancelled: 'status-cancelled',
    Active: 'status-confirmed', Inactive: 'status-cancelled',
};

const EMPTY_HOTEL_FORM = {
    name: '', description: '', address: '', city: '', country: '',
    postalCode: '', starRating: 3, phoneNumber: '', email: '',
    website: '', checkInTime: '15:00', checkOutTime: '11:00', mainImageUrl: '',
};

const AdminDashboard = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [deletingId, setDeletingId] = useState(null);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingHotel, setEditingHotel] = useState(null); // null = add mode, object = edit mode
    const [hotelForm, setHotelForm] = useState(EMPTY_HOTEL_FORM);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [hotelsRes, bookingsRes] = await Promise.all([getHotels(), getAllBookings()]);
                setHotels(hotelsRes.data || []);
                setBookings(bookingsRes.data || []);
            } catch {
                setHotels([]);
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const openAddModal = () => {
        setEditingHotel(null);
        setHotelForm(EMPTY_HOTEL_FORM);
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (hotel) => {
        setEditingHotel(hotel);
        setHotelForm({
            name: hotel.name || '',
            description: hotel.description || '',
            address: hotel.address || '',
            city: hotel.city || '',
            country: hotel.country || '',
            postalCode: hotel.postalCode || '',
            starRating: hotel.starRating || 3,
            phoneNumber: hotel.phoneNumber || '',
            email: hotel.email || '',
            website: hotel.website || '',
            checkInTime: hotel.checkInTime || '15:00',
            checkOutTime: hotel.checkOutTime || '11:00',
            mainImageUrl: hotel.mainImageUrl || '',
        });
        setFormError('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingHotel(null);
        setHotelForm(EMPTY_HOTEL_FORM);
        setFormError('');
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setHotelForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveHotel = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError('');
        try {
            const payload = { ...hotelForm, starRating: Number(hotelForm.starRating) };
            if (editingHotel) {
                const res = await updateHotel(editingHotel.id, payload);
                setHotels(prev => prev.map(h => h.id === editingHotel.id ? res.data : h));
            } else {
                const res = await createHotel(payload);
                setHotels(prev => [...prev, res.data]);
            }
            closeModal();
        } catch (err) {
            setFormError(err?.response?.data?.message || 'Failed to save hotel. Check all fields and try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteHotel = async (hotelId, hotelName) => {
        if (!window.confirm(`Delete "${hotelName}"? This action cannot be undone.`)) return;
        setDeletingId(hotelId);
        try {
            await deleteHotel(hotelId);
            setHotels(prev => prev.filter(h => h.id !== hotelId));
        } catch {
            alert('Failed to delete hotel. It may have active bookings.');
        } finally {
            setDeletingId(null);
        }
    };

    const totalRevenue = bookings
        .filter(b => b.status !== 'Cancelled')
        .reduce((s, b) => s + (b.totalPrice || 0), 0);
    const totalGuests = bookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed').length;

    const TABS = [
        { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
        { key: 'hotels', label: 'Hotels', icon: <Hotel size={16} /> },
        { key: 'bookings', label: 'Booking History', icon: <BookOpen size={16} /> },
    ];

    return (
        <div className="admin-page">
            {/* Admin Sidebar */}
            <aside className="admin-sidebar glass-card">
                <div className="admin-brand">
                    <span className="admin-brand-icon">🏨</span>
                    <span className="admin-brand-text">Admin<span className="text-gradient">Panel</span></span>
                </div>
                <nav className="admin-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`admin-nav-item ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                            id={`admin-tab-${tab.key}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <div className="admin-user">
                        <div className="admin-avatar">{user?.firstName?.[0] || 'A'}</div>
                        <div>
                            <div className="admin-user-name">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Admin'}</div>
                            <div className="admin-user-role">Administrator</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={() => { logout(); navigate('/'); }}>
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main">
                <div className="admin-topbar">
                    <h1 className="admin-page-title">
                        {activeTab === 'overview' && '📊 Dashboard Overview'}
                        {activeTab === 'hotels' && '🏨 Hotel Management'}
                        {activeTab === 'bookings' && '📋 Booking History — All Users'}
                    </h1>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="admin-overview animate-fade-in">
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card glass-card">
                                <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}><Hotel size={22} color="white" /></div>
                                <div className="admin-stat-value">{hotels.length}</div>
                                <div className="admin-stat-label">Total Hotels</div>
                            </div>
                            <div className="admin-stat-card glass-card">
                                <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}><BookOpen size={22} color="white" /></div>
                                <div className="admin-stat-value">{bookings.length}</div>
                                <div className="admin-stat-label">Total Bookings</div>
                            </div>
                            <div className="admin-stat-card glass-card">
                                <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}><TrendingUp size={22} color="white" /></div>
                                <div className="admin-stat-value">${totalRevenue.toLocaleString()}</div>
                                <div className="admin-stat-label">Total Revenue</div>
                            </div>
                            <div className="admin-stat-card glass-card">
                                <div className="admin-stat-icon" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}><Users size={22} color="white" /></div>
                                <div className="admin-stat-value">{totalGuests}</div>
                                <div className="admin-stat-label">Guests Served</div>
                            </div>
                        </div>

                        <div className="admin-table-card glass-card">
                            <div className="table-header">
                                <h2>Recent Bookings</h2>
                                <button className="text-link" onClick={() => setActiveTab('bookings')}>View All <ChevronRight size={14} /></button>
                            </div>
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Ref</th><th>Guest</th><th>Hotel</th><th>Amount</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {bookings.slice(0, 5).map(b => (
                                        <tr key={b.id}>
                                            <td><span className="booking-id-cell">{b.bookingReference}</span></td>
                                            <td>{b.guestName || '—'}</td>
                                            <td>{b.hotelName}</td>
                                            <td><strong>${(b.totalPrice || 0).toLocaleString()}</strong></td>
                                            <td><span className={`table-badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Hotels Tab */}
                {activeTab === 'hotels' && (
                    <div className="admin-hotels animate-fade-in">
                        {/* Prominent Add Hotel Banner */}
                        <div className="glass-card add-hotel-banner">
                            <div>
                                <h3 style={{ margin: 0 }}>🏨 Hotel Management</h3>
                                <p style={{ margin: '0.3rem 0 0', color: 'var(--gray)', fontSize: '0.9rem' }}>
                                    Add new hotels, edit existing details, or remove hotels that are no longer active.
                                </p>
                            </div>
                            <button
                                className="btn btn-primary"
                                id="add-hotel-btn"
                                onClick={openAddModal}
                                style={{ whiteSpace: 'nowrap', fontSize: '1rem', padding: '0.75rem 1.5rem', gap: '0.5rem' }}
                            >
                                <PlusCircle size={20} /> Add New Hotel
                            </button>
                        </div>

                        <div className="admin-table-card glass-card" style={{ marginTop: '1rem', overflowX: 'auto' }}>
                            {hotels.length === 0 && !loading ? (
                                <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                    <Hotel size={48} style={{ marginBottom: '1rem' }} />
                                    <h3>No hotels yet</h3>
                                    <p>Click "Add New Hotel" above to register your first hotel business.</p>
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Hotel Name</th>
                                            <th>Location</th>
                                            <th>Stars</th>
                                            <th>Rooms</th>
                                            <th style={{ minWidth: '220px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hotels.map((hotel) => (
                                            <tr key={hotel.id} id={`admin-hotel-row-${hotel.id}`}>
                                                <td><strong>{hotel.name}</strong></td>
                                                <td>{hotel.city}, {hotel.country}</td>
                                                <td>{'⭐'.repeat(hotel.starRating || 0)}</td>
                                                <td>{hotel.rooms?.length ?? '—'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="action-btn action-btn-view"
                                                            title="View Hotel Page"
                                                            onClick={() => navigate(`/hotels/${hotel.id}`)}
                                                            id={`view-hotel-${hotel.id}`}
                                                        >
                                                            <Eye size={14} /> View
                                                        </button>
                                                        <button
                                                            className="action-btn action-btn-edit"
                                                            title="Edit Hotel"
                                                            onClick={() => openEditModal(hotel)}
                                                            id={`edit-hotel-${hotel.id}`}
                                                        >
                                                            <Edit3 size={14} /> Edit
                                                        </button>
                                                        <button
                                                            className="action-btn action-btn-delete"
                                                            title="Delete Hotel"
                                                            disabled={deletingId === hotel.id}
                                                            onClick={() => handleDeleteHotel(hotel.id, hotel.name)}
                                                            id={`delete-hotel-${hotel.id}`}
                                                        >
                                                            {deletingId === hotel.id ? '⌛' : <><Trash2 size={14} /> Delete</>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Booking History Tab (All Users) */}
                {activeTab === 'bookings' && (
                    <div className="admin-bookings-tab animate-fade-in">
                        <div className="admin-table-card glass-card">
                            <table className="admin-table">
                                <thead>
                                    <tr><th>Ref</th><th>Guest</th><th>Email</th><th>Hotel</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Amount</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {bookings.map((b) => (
                                        <tr key={b.id}>
                                            <td><span className="booking-id-cell">{b.bookingReference}</span></td>
                                            <td>{b.guestName || '—'}</td>
                                            <td style={{ fontSize: '0.75rem', opacity: 0.7 }}>{b.guestEmail || '—'}</td>
                                            <td>{b.hotelName}</td>
                                            <td>{b.roomType} ({b.roomNumber})</td>
                                            <td>{b.checkInDate?.substring(0, 10)}</td>
                                            <td>{b.checkOutDate?.substring(0, 10)}</td>
                                            <td><strong>${(b.totalPrice || 0).toLocaleString()}</strong></td>
                                            <td><span className={`table-badge ${STATUS_COLORS[b.status]}`}>{b.status}</span></td>
                                        </tr>
                                    ))}
                                    {bookings.length === 0 && !loading && (
                                        <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>No bookings recorded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Add / Edit Hotel Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-card glass-card" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                            <button className="modal-close-btn" onClick={closeModal}><X size={20} /></button>
                        </div>
                        <form className="modal-form" onSubmit={handleSaveHotel}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hotel Name *</label>
                                    <input name="name" value={hotelForm.name} onChange={handleFormChange} required placeholder="Grand Plaza Hotel" />
                                </div>
                                <div className="form-group">
                                    <label>Star Rating</label>
                                    <select name="starRating" value={hotelForm.starRating} onChange={handleFormChange}>
                                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea name="description" value={hotelForm.description} onChange={handleFormChange} required rows={3} placeholder="A short description of the hotel..." />
                            </div>
                            <div className="form-group">
                                <label>Address *</label>
                                <input name="address" value={hotelForm.address} onChange={handleFormChange} required placeholder="123 Main St" />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input name="city" value={hotelForm.city} onChange={handleFormChange} required placeholder="New York" />
                                </div>
                                <div className="form-group">
                                    <label>Country *</label>
                                    <input name="country" value={hotelForm.country} onChange={handleFormChange} required placeholder="USA" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input name="phoneNumber" value={hotelForm.phoneNumber} onChange={handleFormChange} placeholder="+1-212-555-0000" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input name="email" value={hotelForm.email} onChange={handleFormChange} type="email" placeholder="info@hotel.com" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Check-in Time</label>
                                    <input name="checkInTime" value={hotelForm.checkInTime} onChange={handleFormChange} placeholder="15:00" />
                                </div>
                                <div className="form-group">
                                    <label>Check-out Time</label>
                                    <input name="checkOutTime" value={hotelForm.checkOutTime} onChange={handleFormChange} placeholder="11:00" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Main Image URL</label>
                                <input name="mainImageUrl" value={hotelForm.mainImageUrl} onChange={handleFormChange} placeholder="https://..." />
                            </div>
                            {formError && <div className="form-error-msg">{formError}</div>}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} id="save-hotel-btn">
                                    {saving ? '⌛ Saving...' : <><Save size={16} /> {editingHotel ? 'Save Changes' : 'Create Hotel'}</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
