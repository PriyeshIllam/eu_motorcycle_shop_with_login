import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BikerMotorcycle } from '../types/biker-motorcycle';
import {
    BookingRequest as BookingRequestType,
    BookingRequestFormData,
    BookingRequestWithDetails,
    SERVICE_TYPE_LABELS,
    URGENCY_LABELS,
    CONTACT_METHOD_LABELS,
    STATUS_LABELS,
    ServiceType,
    UrgencyLevel,
    ContactMethod,
    BookingStatus
} from '../types/booking-request';

interface BookingRequestProps {
    onBack: () => void;
}

export const BookingRequest: React.FC<BookingRequestProps> = ({ onBack }) => {
    const [motorcycles, setMotorcycles] = useState<BikerMotorcycle[]>([]);
    const [bookings, setBookings] = useState<BookingRequestWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [formData, setFormData] = useState<BookingRequestFormData>({
        motorcycle_id: '',
        service_type: '',
        description: '',
        preferred_date: '',
        preferred_time: '',
        contact_phone: '',
        contact_method: 'email',
        urgency: 'normal',
        estimated_budget: '',
        currency: 'EUR'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError('You must be logged in to view booking requests');
                return;
            }

            // Load motorcycles
            const { data: motorcyclesData, error: motorcyclesError } = await supabase
                .from('biker_motorcycles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (motorcyclesError) throw motorcyclesError;
            setMotorcycles(motorcyclesData || []);

            // Load booking requests with details
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('booking_requests_with_details')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (bookingsError) throw bookingsError;
            setBookings(bookingsData || []);

            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            motorcycle_id: '',
            service_type: '',
            description: '',
            preferred_date: '',
            preferred_time: '',
            contact_phone: '',
            contact_method: 'email',
            urgency: 'normal',
            estimated_budget: '',
            currency: 'EUR'
        });
        setShowForm(false);
        setError(null);
        setSuccess(null);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(null);
    };

    const validateForm = (): string | null => {
        if (!formData.motorcycle_id) {
            return 'Please select a motorcycle';
        }
        if (!formData.service_type) {
            return 'Please select a service type';
        }
        if (!formData.description.trim()) {
            return 'Please provide a description of what you need';
        }
        if (formData.description.trim().length < 10) {
            return 'Description must be at least 10 characters';
        }
        if (!formData.preferred_date) {
            return 'Please select a preferred date';
        }
        if (!formData.preferred_time) {
            return 'Please select a preferred time';
        }

        // Validate date is not in the past
        const selectedDate = new Date(formData.preferred_date + 'T' + formData.preferred_time);
        const now = new Date();
        if (selectedDate < now) {
            return 'Preferred date and time must be in the future';
        }

        // Validate phone if contact method includes phone
        if ((formData.contact_method === 'phone' || formData.contact_method === 'both') && !formData.contact_phone.trim()) {
            return 'Please provide a contact phone number';
        }

        // Validate budget if provided
        if (formData.estimated_budget && isNaN(parseFloat(formData.estimated_budget))) {
            return 'Estimated budget must be a valid number';
        }

        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setError('You must be logged in to create a booking request');
                return;
            }

            // Prepare booking data
            const bookingData: any = {
                user_id: user.id,
                motorcycle_id: formData.motorcycle_id,
                service_type: formData.service_type,
                description: formData.description.trim(),
                preferred_date: formData.preferred_date,
                preferred_time: formData.preferred_time,
                contact_method: formData.contact_method,
                urgency: formData.urgency,
                currency: formData.currency,
                status: 'pending'
            };

            // Add optional fields if provided
            if (formData.contact_phone.trim()) {
                bookingData.contact_phone = formData.contact_phone.trim();
            }
            if (formData.estimated_budget) {
                bookingData.estimated_budget = parseFloat(formData.estimated_budget);
            }

            // Insert booking request
            const { data, error: insertError } = await supabase
                .from('booking_requests')
                .insert([bookingData])
                .select()
                .single();

            if (insertError) throw insertError;

            setSuccess('Booking request submitted successfully! We will contact you soon.');
            resetForm();
            await loadData(); // Reload bookings

        } catch (err) {
            console.error('Error submitting booking request:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit booking request');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to cancel this booking request?')) {
            return;
        }

        try {
            const { error: updateError } = await supabase
                .from('booking_requests')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);

            if (updateError) throw updateError;

            setSuccess('Booking request cancelled successfully');
            await loadData();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to cancel booking');
        }
    };

    const handleDeleteBooking = async (bookingId: string) => {
        if (!confirm('Are you sure you want to delete this booking request? This cannot be undone.')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('booking_requests')
                .delete()
                .eq('id', bookingId);

            if (deleteError) throw deleteError;

            setSuccess('Booking request deleted successfully');
            await loadData();
        } catch (err) {
            console.error('Error deleting booking:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete booking');
        }
    };

    const getStatusClass = (status: BookingStatus) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'confirmed': return 'status-confirmed';
            case 'in_progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const getUrgencyClass = (urgency: UrgencyLevel) => {
        switch (urgency) {
            case 'emergency': return 'urgency-emergency';
            case 'high': return 'urgency-high';
            case 'normal': return 'urgency-normal';
            case 'low': return 'urgency-low';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="booking-request-container">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="booking-request-container">
            <div className="booking-header">
                <button onClick={onBack} className="back-button">← Back to Profile</button>
                <h2>Service Booking Requests</h2>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            {motorcycles.length === 0 && (
                <div className="info-message">
                    You need to add a motorcycle to your profile before creating a booking request.
                </div>
            )}

            {motorcycles.length > 0 && !showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    className="primary-button"
                >
                    + New Booking Request
                </button>
            )}

            {showForm && (
                <div className="booking-form-card">
                    <h3>Create Booking Request</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="motorcycle_id">
                                Select Motorcycle <span className="required">*</span>
                            </label>
                            <select
                                id="motorcycle_id"
                                name="motorcycle_id"
                                value={formData.motorcycle_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">-- Select a motorcycle --</option>
                                {motorcycles.map(motorcycle => (
                                    <option key={motorcycle.id} value={motorcycle.id}>
                                        {motorcycle.brand} {motorcycle.model} ({motorcycle.year})
                                        {motorcycle.license_plate ? ` - ${motorcycle.license_plate}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="service_type">
                                Service Type <span className="required">*</span>
                            </label>
                            <select
                                id="service_type"
                                name="service_type"
                                value={formData.service_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">-- Select service type --</option>
                                {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                What do you need? <span className="required">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Please describe what service or repair you need in detail..."
                                required
                            />
                            <small>Minimum 10 characters. Be specific about what you need.</small>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="preferred_date">
                                    Preferred Date <span className="required">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="preferred_date"
                                    name="preferred_date"
                                    value={formData.preferred_date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="preferred_time">
                                    Preferred Time <span className="required">*</span>
                                </label>
                                <input
                                    type="time"
                                    id="preferred_time"
                                    name="preferred_time"
                                    value={formData.preferred_time}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="urgency">
                                Urgency Level <span className="required">*</span>
                            </label>
                            <select
                                id="urgency"
                                name="urgency"
                                value={formData.urgency}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.entries(URGENCY_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="contact_method">
                                Preferred Contact Method <span className="required">*</span>
                            </label>
                            <select
                                id="contact_method"
                                name="contact_method"
                                value={formData.contact_method}
                                onChange={handleInputChange}
                                required
                            >
                                {Object.entries(CONTACT_METHOD_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {(formData.contact_method === 'phone' || formData.contact_method === 'both') && (
                            <div className="form-group">
                                <label htmlFor="contact_phone">
                                    Contact Phone <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="contact_phone"
                                    name="contact_phone"
                                    value={formData.contact_phone}
                                    onChange={handleInputChange}
                                    placeholder="+49 123 456 7890"
                                    required
                                />
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="estimated_budget">
                                    Estimated Budget (Optional)
                                </label>
                                <input
                                    type="number"
                                    id="estimated_budget"
                                    name="estimated_budget"
                                    value={formData.estimated_budget}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="currency">
                                    Currency
                                </label>
                                <select
                                    id="currency"
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleInputChange}
                                >
                                    <option value="EUR">EUR (€)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CHF">CHF (Fr)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="submit-button"
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'Submitting...' : 'Submit Booking Request'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="cancel-button"
                                disabled={submitLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bookings-list">
                <h3>Your Booking Requests ({bookings.length})</h3>

                {bookings.length === 0 && (
                    <div className="no-bookings">
                        No booking requests yet. Create your first one above!
                    </div>
                )}

                {bookings.map(booking => (
                    <div key={booking.id} className="booking-card">
                        <div className="booking-header-row">
                            <div className="booking-title">
                                <h4>{SERVICE_TYPE_LABELS[booking.service_type as ServiceType] || booking.service_type}</h4>
                                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                    {STATUS_LABELS[booking.status]}
                                </span>
                                <span className={`urgency-badge ${getUrgencyClass(booking.urgency)}`}>
                                    {URGENCY_LABELS[booking.urgency]}
                                </span>
                            </div>
                            <div className="booking-date">
                                Created: {new Date(booking.created_at).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="booking-details">
                            <div className="detail-row">
                                <strong>Motorcycle:</strong>
                                <span>
                                    {booking.brand} {booking.model} ({booking.year})
                                    {booking.license_plate && ` - ${booking.license_plate}`}
                                </span>
                            </div>

                            <div className="detail-row">
                                <strong>Description:</strong>
                                <span>{booking.description}</span>
                            </div>

                            <div className="detail-row">
                                <strong>Preferred Date & Time:</strong>
                                <span>
                                    {new Date(booking.preferred_date).toLocaleDateString()} at {booking.preferred_time}
                                </span>
                            </div>

                            {booking.confirmed_date && booking.confirmed_time && (
                                <div className="detail-row confirmed">
                                    <strong>Confirmed Date & Time:</strong>
                                    <span>
                                        {new Date(booking.confirmed_date).toLocaleDateString()} at {booking.confirmed_time}
                                    </span>
                                </div>
                            )}

                            <div className="detail-row">
                                <strong>Contact Method:</strong>
                                <span>
                                    {CONTACT_METHOD_LABELS[booking.contact_method]}
                                    {booking.contact_phone && ` - ${booking.contact_phone}`}
                                </span>
                            </div>

                            {booking.estimated_budget && (
                                <div className="detail-row">
                                    <strong>Estimated Budget:</strong>
                                    <span>{booking.estimated_budget.toFixed(2)} {booking.currency}</span>
                                </div>
                            )}

                            {booking.admin_notes && (
                                <div className="detail-row admin-notes">
                                    <strong>Shop Response:</strong>
                                    <span>{booking.admin_notes}</span>
                                </div>
                            )}
                        </div>

                        {booking.status === 'pending' && (
                            <div className="booking-actions">
                                <button
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="cancel-booking-button"
                                >
                                    Cancel Request
                                </button>
                                <button
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="delete-booking-button"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
