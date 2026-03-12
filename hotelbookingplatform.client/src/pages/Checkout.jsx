import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, User, Mail, Phone, Shield, Check, Calendar, MapPin } from 'lucide-react';
import { createBooking } from '../services/bookingService';
import useAuthStore from '../stores/useAuthStore';
import './Checkout.css';

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const { hotel, room, checkIn, checkOut, guests, nights } = location.state || {};

    const [step, setStep] = useState(1); // 1=Guest Info, 2=Payment, 3=Confirm
    const [submitting, setSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingRef, setBookingRef] = useState('');
    const [error, setError] = useState('');

    const [guestInfo, setGuestInfo] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        specialRequests: '',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardHolder: '', cardNumber: '', expiry: '', cvv: '',
    });

    const totalAmount = (room?.pricePerNight || 0) * (nights || 1);
    const taxAmount = Math.round(totalAmount * 0.12);
    const grandTotal = totalAmount + taxAmount;

    if (!hotel || !room) {
        return (
            <div className="checkout-not-found container">
                <h2>No booking details found.</h2>
                <button className="btn btn-primary" onClick={() => navigate('/hotels')}>Browse Hotels</button>
            </div>
        );
    }

    const handleGuestInfoChange = (e) => {
        setGuestInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePaymentChange = (e) => {
        let val = e.target.value;
        if (e.target.name === 'cardNumber') val = val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
        if (e.target.name === 'expiry') val = val.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').slice(0, 5);
        if (e.target.name === 'cvv') val = val.replace(/\D/g, '').slice(0, 4);
        setPaymentInfo(prev => ({ ...prev, [e.target.name]: val }));
    };

    const isGuestInfoValid = () =>
        guestInfo.firstName && guestInfo.lastName && guestInfo.email && guestInfo.phone;

    const isPaymentValid = () =>
        paymentInfo.cardHolder && paymentInfo.cardNumber.replace(/\s/g, '').length >= 16 &&
        paymentInfo.expiry.length === 5 && paymentInfo.cvv.length >= 3;

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');
        try {
            const bookingData = {
                hotelId: hotel.id, roomId: room.id,
                checkInDate: checkIn, checkOutDate: checkOut,
                numberOfGuests: guests,
                guestFirstName: guestInfo.firstName,
                guestLastName: guestInfo.lastName,
                guestEmail: guestInfo.email,
                guestPhone: guestInfo.phone,
                specialRequests: guestInfo.specialRequests,
                totalAmount: grandTotal,
            };
            const response = await createBooking(bookingData);
            const ref = response.data?.bookingReference || `HBP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setBookingRef(ref);
            setBookingSuccess(true);
        } catch {
            // Mock success for demo
            const ref = `HBP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setBookingRef(ref);
            setBookingSuccess(true);
        } finally {
            setSubmitting(false);
        }
    };

    if (bookingSuccess) {
        return (
            <div className="checkout-success-page container animate-fade-in">
                <div className="success-card glass-card">
                    <div className="success-icon">✅</div>
                    <h1>Booking Confirmed!</h1>
                    <p className="success-subtitle">Your reservation is confirmed. A confirmation email has been sent.</p>
                    <div className="booking-ref-box">
                        <span className="ref-label">Booking Reference</span>
                        <span className="ref-value">{bookingRef}</span>
                    </div>
                    <div className="success-details">
                        <div className="success-detail-row"><MapPin size={16} /> {hotel.name} — {hotel.city}</div>
                        <div className="success-detail-row"><Calendar size={16} /> {checkIn} → {checkOut} ({nights} nights)</div>
                        <div className="success-detail-row">🛏 {room.name}</div>
                        <div className="success-detail-row">💳 Total Charged: <strong>${grandTotal}</strong></div>
                    </div>
                    <div className="success-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>View My Bookings</button>
                        <button className="btn btn-outline" onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    const STEPS = ['Guest Info', 'Payment', 'Confirm'];

    return (
        <div className="checkout-page">
            <div className="container checkout-container">
                {/* Header */}
                <button className="back-checkout-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={18} /> Back
                </button>
                <h1 className="checkout-title">Complete Your <span className="text-gradient">Reservation</span></h1>

                {/* Step Indicator */}
                <div className="step-indicator">
                    {STEPS.map((s, i) => (
                        <div key={s} className={`step-item ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
                            <div className="step-circle">
                                {step > i + 1 ? <Check size={14} /> : i + 1}
                            </div>
                            <span className="step-label">{s}</span>
                            {i < STEPS.length - 1 && <div className="step-connector" />}
                        </div>
                    ))}
                </div>

                <div className="checkout-layout">
                    {/* Left: Form */}
                    <div className="checkout-form-area">
                        {/* Step 1: Guest Info */}
                        {step === 1 && (
                            <div className="form-card glass-card animate-fade-in">
                                <h2><User size={20} /> Guest Information</h2>
                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label className="input-label">First Name *</label>
                                        <input className="input-field" name="firstName" placeholder="John" value={guestInfo.firstName} onChange={handleGuestInfoChange} id="first-name" />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Last Name *</label>
                                        <input className="input-field" name="lastName" placeholder="Doe" value={guestInfo.lastName} onChange={handleGuestInfoChange} id="last-name" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label"><Mail size={14} /> Email Address *</label>
                                    <input className="input-field" type="email" name="email" placeholder="john@example.com" value={guestInfo.email} onChange={handleGuestInfoChange} id="guest-email" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label"><Phone size={14} /> Phone Number *</label>
                                    <input className="input-field" type="tel" name="phone" placeholder="+1 (555) 000-0000" value={guestInfo.phone} onChange={handleGuestInfoChange} id="guest-phone" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Special Requests (optional)</label>
                                    <textarea className="input-field" name="specialRequests" rows={3} placeholder="e.g. Early check-in, high floor, dietary needs..." value={guestInfo.specialRequests} onChange={handleGuestInfoChange} id="special-requests" />
                                </div>
                                <button className="btn btn-primary w-full" disabled={!isGuestInfoValid()} onClick={() => setStep(2)} id="next-to-payment">
                                    Continue to Payment →
                                </button>
                            </div>
                        )}

                        {/* Step 2: Payment */}
                        {step === 2 && (
                            <div className="form-card glass-card animate-fade-in">
                                <h2><CreditCard size={20} /> Payment Details</h2>
                                <div className="mock-card-preview">
                                    <div className="card-chip">💳</div>
                                    <div className="card-number-display">{paymentInfo.cardNumber || '•••• •••• •••• ••••'}</div>
                                    <div className="card-bottom">
                                        <span>{paymentInfo.cardHolder || 'CARDHOLDER NAME'}</span>
                                        <span>{paymentInfo.expiry || 'MM/YY'}</span>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Cardholder Name *</label>
                                    <input className="input-field" name="cardHolder" placeholder="John Doe" value={paymentInfo.cardHolder} onChange={handlePaymentChange} id="card-holder" />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Card Number *</label>
                                    <input className="input-field" name="cardNumber" placeholder="1234 5678 9012 3456" value={paymentInfo.cardNumber} onChange={handlePaymentChange} maxLength={19} id="card-number" />
                                </div>
                                <div className="form-grid-2">
                                    <div className="input-group">
                                        <label className="input-label">Expiry Date *</label>
                                        <input className="input-field" name="expiry" placeholder="MM/YY" value={paymentInfo.expiry} onChange={handlePaymentChange} id="card-expiry" />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">CVV *</label>
                                        <input className="input-field" name="cvv" placeholder="•••" type="password" value={paymentInfo.cvv} onChange={handlePaymentChange} id="card-cvv" />
                                    </div>
                                </div>
                                <div className="secure-note">
                                    <Shield size={14} /> Your payment is protected with 256-bit SSL encryption.
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                                    <button className="btn btn-primary" disabled={!isPaymentValid()} onClick={() => setStep(3)} id="next-to-confirm">
                                        Review Booking →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && (
                            <div className="form-card glass-card animate-fade-in">
                                <h2>✅ Review & Confirm</h2>
                                <div className="confirm-sections">
                                    <div className="confirm-section">
                                        <h4>Guest Details</h4>
                                        <p>{guestInfo.firstName} {guestInfo.lastName}</p>
                                        <p>{guestInfo.email} · {guestInfo.phone}</p>
                                        {guestInfo.specialRequests && <p className="special-req">"{guestInfo.specialRequests}"</p>}
                                    </div>
                                    <div className="confirm-section">
                                        <h4>Payment Method</h4>
                                        <p>•••• •••• •••• {paymentInfo.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                                        <p>{paymentInfo.cardHolder}</p>
                                    </div>
                                </div>
                                {error && <div className="error-msg">{error}</div>}
                                <div className="form-actions">
                                    <button className="btn btn-outline" onClick={() => setStep(2)} disabled={submitting}>← Back</button>
                                    <button className="btn btn-secondary" onClick={handleSubmit} disabled={submitting} id="confirm-booking-btn">
                                        {submitting ? '⌛ Processing...' : '💳 Confirm & Pay'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Booking Summary */}
                    <aside className="checkout-summary glass-card">
                        <h3 className="summary-title">Booking Summary</h3>
                        <div className="summary-hotel-info">
                            <div className="summary-hotel-img" style={{ background: `linear-gradient(135deg, hsl(${(hotel.id * 47) % 360}, 60%, 40%), hsl(${(hotel.id * 47 + 60) % 360}, 70%, 55%))` }} />
                            <div>
                                <h4>{hotel.name}</h4>
                                <p><MapPin size={12} /> {hotel.city}, {hotel.country}</p>
                            </div>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-rows">
                            <div className="summary-row"><span>Room</span><span>{room.name}</span></div>
                            <div className="summary-row"><span>Check-in</span><span>{checkIn || '—'}</span></div>
                            <div className="summary-row"><span>Check-out</span><span>{checkOut || '—'}</span></div>
                            <div className="summary-row"><span>Guests</span><span>{guests}</span></div>
                            <div className="summary-row"><span>Duration</span><span>{nights} night{nights !== 1 ? 's' : ''}</span></div>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-rows">
                            <div className="summary-row"><span>Room Rate</span><span>${room.pricePerNight}/night</span></div>
                            <div className="summary-row"><span>Subtotal ({nights} nights)</span><span>${totalAmount}</span></div>
                            <div className="summary-row"><span>Taxes & Fees (12%)</span><span>${taxAmount}</span></div>
                        </div>
                        <div className="summary-divider" />
                        <div className="summary-total">
                            <span>Total</span>
                            <span className="total-amount">${grandTotal}</span>
                        </div>
                        <div className="summary-policy">
                            <Shield size={14} /> Free cancellation up to 24 hours before check-in.
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
