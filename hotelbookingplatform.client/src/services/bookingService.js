import apiClient from './apiClient';

// Create a new booking
export const createBooking = (data) => apiClient.post('/Bookings', data);

// Get bookings for the logged-in user
export const getMyBookings = () => apiClient.get('/Bookings/my');

// Get a single booking by ID
export const getBookingById = (id) => apiClient.get(`/Bookings/${id}`);

// Cancel a booking
export const cancelBooking = (id) => apiClient.put(`/Bookings/${id}/cancel`);

// Admin: get all bookings across all users
export const getAllBookings = (params = {}) => apiClient.get('/Bookings/all', { params });

// Admin: confirm a booking
export const confirmBooking = (id) => apiClient.put(`/Bookings/${id}/confirm`);
