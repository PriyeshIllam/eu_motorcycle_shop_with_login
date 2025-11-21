import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BikerMotorcycle, MotorcycleFormData, MOTORCYCLE_BRANDS } from '../types/biker-motorcycle';

interface BikerProfileProps {
    onBack?: () => void;
    onLogout?: () => void;
}

export const BikerProfile: React.FC<BikerProfileProps> = ({ onBack, onLogout }) => {
    const [motorcycles, setMotorcycles] = useState<BikerMotorcycle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    const [formData, setFormData] = useState<MotorcycleFormData>({
        brand: '',
        model: '',
        year: '',
        mileage: '',
        mileage_unit: 'km',
        engine_size: '',
        color: '',
        license_plate: '',
        vin: '',
        purchase_date: '',
        current_owner: true,
        condition: '',
        notes: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        loadUserData();
        loadMotorcycles();
    }, []);

    const loadUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
            setUserEmail(user.email);
        }
    };

    const loadMotorcycles = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('biker_motorcycles')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setMotorcycles(data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading motorcycles:', err);
            setError(err instanceof Error ? err.message : 'Failed to load motorcycles');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            brand: '',
            model: '',
            year: '',
            mileage: '',
            mileage_unit: 'km',
            engine_size: '',
            color: '',
            license_plate: '',
            vin: '',
            purchase_date: '',
            current_owner: true,
            condition: '',
            notes: ''
        });
        setFormErrors({});
        setEditingId(null);
        setShowForm(false);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.brand.trim()) {
            errors.brand = 'Brand is required';
        }

        if (!formData.model.trim()) {
            errors.model = 'Model is required';
        }

        if (!formData.year) {
            errors.year = 'Year is required';
        } else {
            const year = parseInt(formData.year);
            if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 1) {
                errors.year = 'Please enter a valid year';
            }
        }

        if (formData.mileage && parseInt(formData.mileage) < 0) {
            errors.mileage = 'Mileage cannot be negative';
        }

        if (formData.engine_size && parseInt(formData.engine_size) <= 0) {
            errors.engine_size = 'Engine size must be positive';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitLoading(true);
        setError(null);

        try {
            const motorcycleData = {
                brand: formData.brand.trim(),
                model: formData.model.trim(),
                year: parseInt(formData.year),
                mileage: formData.mileage ? parseInt(formData.mileage) : null,
                mileage_unit: formData.mileage_unit,
                engine_size: formData.engine_size ? parseInt(formData.engine_size) : null,
                color: formData.color.trim() || null,
                license_plate: formData.license_plate.trim() || null,
                vin: formData.vin.trim() || null,
                purchase_date: formData.purchase_date || null,
                current_owner: formData.current_owner,
                condition: formData.condition || null,
                notes: formData.notes.trim() || null
            };

            if (editingId) {
                // Update existing motorcycle
                const { error: updateError } = await supabase
                    .from('biker_motorcycles')
                    .update(motorcycleData)
                    .eq('id', editingId);

                if (updateError) throw updateError;
            } else {
                // Insert new motorcycle
                const { error: insertError } = await supabase
                    .from('biker_motorcycles')
                    .insert([motorcycleData]);

                if (insertError) throw insertError;
            }

            await loadMotorcycles();
            resetForm();
        } catch (err) {
            console.error('Error saving motorcycle:', err);
            setError(err instanceof Error ? err.message : 'Failed to save motorcycle');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (motorcycle: BikerMotorcycle) => {
        setFormData({
            brand: motorcycle.brand,
            model: motorcycle.model,
            year: motorcycle.year.toString(),
            mileage: motorcycle.mileage?.toString() || '',
            mileage_unit: motorcycle.mileage_unit,
            engine_size: motorcycle.engine_size?.toString() || '',
            color: motorcycle.color || '',
            license_plate: motorcycle.license_plate || '',
            vin: motorcycle.vin || '',
            purchase_date: motorcycle.purchase_date || '',
            current_owner: motorcycle.current_owner,
            condition: motorcycle.condition || '',
            notes: motorcycle.notes || ''
        });
        setEditingId(motorcycle.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this motorcycle?')) {
            return;
        }

        try {
            const { error: deleteError } = await supabase
                .from('biker_motorcycles')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await loadMotorcycles();
        } catch (err) {
            console.error('Error deleting motorcycle:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete motorcycle');
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));

        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <div className="biker-profile-container">
            <header className="profile-header">
                <div className="header-content">
                    <h1>🏍️ My Motorcycle Garage</h1>
                    <p className="user-email">{userEmail}</p>
                </div>
                <div className="header-actions">
                    {onBack && (
                        <button className="back-button" onClick={onBack}>
                            ← Back to Directory
                        </button>
                    )}
                    {onLogout && (
                        <button className="logout-button" onClick={onLogout}>
                            Logout
                        </button>
                    )}
                </div>
            </header>

            <div className="profile-content">
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                <div className="add-motorcycle-section">
                    {!showForm ? (
                        <button
                            className="add-motorcycle-button"
                            onClick={() => setShowForm(true)}
                        >
                            + Add New Motorcycle
                        </button>
                    ) : (
                        <div className="motorcycle-form-container">
                            <h2>{editingId ? 'Edit Motorcycle' : 'Add New Motorcycle'}</h2>
                            <form onSubmit={handleSubmit} className="motorcycle-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label htmlFor="brand">
                                            Brand <span className="required">*</span>
                                        </label>
                                        <select
                                            id="brand"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select Brand</option>
                                            {MOTORCYCLE_BRANDS.map(brand => (
                                                <option key={brand} value={brand}>{brand}</option>
                                            ))}
                                        </select>
                                        {formErrors.brand && (
                                            <span className="error-text">{formErrors.brand}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="model">
                                            Model <span className="required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="model"
                                            name="model"
                                            value={formData.model}
                                            onChange={handleInputChange}
                                            placeholder="e.g., R1250GS, Ninja 650"
                                            required
                                        />
                                        {formErrors.model && (
                                            <span className="error-text">{formErrors.model}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="year">
                                            Year <span className="required">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            id="year"
                                            name="year"
                                            value={formData.year}
                                            onChange={handleInputChange}
                                            min="1900"
                                            max={new Date().getFullYear() + 1}
                                            placeholder="e.g., 2023"
                                            required
                                        />
                                        {formErrors.year && (
                                            <span className="error-text">{formErrors.year}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="engine_size">Engine Size (cc)</label>
                                        <input
                                            type="number"
                                            id="engine_size"
                                            name="engine_size"
                                            value={formData.engine_size}
                                            onChange={handleInputChange}
                                            min="1"
                                            placeholder="e.g., 650"
                                        />
                                        {formErrors.engine_size && (
                                            <span className="error-text">{formErrors.engine_size}</span>
                                        )}
                                    </div>

                                    <div className="form-group form-group-mileage">
                                        <label htmlFor="mileage">Mileage</label>
                                        <div className="mileage-input-group">
                                            <input
                                                type="number"
                                                id="mileage"
                                                name="mileage"
                                                value={formData.mileage}
                                                onChange={handleInputChange}
                                                min="0"
                                                placeholder="e.g., 15000"
                                            />
                                            <select
                                                name="mileage_unit"
                                                value={formData.mileage_unit}
                                                onChange={handleInputChange}
                                                className="mileage-unit"
                                            >
                                                <option value="km">km</option>
                                                <option value="miles">miles</option>
                                            </select>
                                        </div>
                                        {formErrors.mileage && (
                                            <span className="error-text">{formErrors.mileage}</span>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="color">Color</label>
                                        <input
                                            type="text"
                                            id="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Black, Red"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="license_plate">License Plate</label>
                                        <input
                                            type="text"
                                            id="license_plate"
                                            name="license_plate"
                                            value={formData.license_plate}
                                            onChange={handleInputChange}
                                            placeholder="e.g., ABC-123"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="vin">VIN</label>
                                        <input
                                            type="text"
                                            id="vin"
                                            name="vin"
                                            value={formData.vin}
                                            onChange={handleInputChange}
                                            placeholder="17-character VIN"
                                            maxLength={17}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="purchase_date">Purchase Date</label>
                                        <input
                                            type="date"
                                            id="purchase_date"
                                            name="purchase_date"
                                            value={formData.purchase_date}
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="condition">Condition</label>
                                        <select
                                            id="condition"
                                            name="condition"
                                            value={formData.condition}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select Condition</option>
                                            <option value="excellent">Excellent</option>
                                            <option value="good">Good</option>
                                            <option value="fair">Fair</option>
                                            <option value="poor">Poor</option>
                                        </select>
                                    </div>

                                    <div className="form-group form-group-checkbox">
                                        <label htmlFor="current_owner">
                                            <input
                                                type="checkbox"
                                                id="current_owner"
                                                name="current_owner"
                                                checked={formData.current_owner}
                                                onChange={handleInputChange}
                                            />
                                            Current Owner
                                        </label>
                                    </div>

                                    <div className="form-group form-group-full">
                                        <label htmlFor="notes">Notes</label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Any additional information about your motorcycle..."
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-button"
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? 'Saving...' : editingId ? 'Update Motorcycle' : 'Add Motorcycle'}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-button"
                                        onClick={resetForm}
                                        disabled={submitLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="motorcycles-list">
                    <h2>Your Motorcycles ({motorcycles.length})</h2>

                    {loading ? (
                        <div className="loading">Loading your motorcycles...</div>
                    ) : motorcycles.length === 0 ? (
                        <div className="no-motorcycles">
                            <p>You haven't added any motorcycles yet.</p>
                            <p>Click "Add New Motorcycle" to get started!</p>
                        </div>
                    ) : (
                        <div className="motorcycles-grid">
                            {motorcycles.map(motorcycle => (
                                <div key={motorcycle.id} className="motorcycle-card">
                                    <div className="motorcycle-header">
                                        <h3>{motorcycle.brand} {motorcycle.model}</h3>
                                        <span className="year-badge">{motorcycle.year}</span>
                                    </div>

                                    <div className="motorcycle-details">
                                        {motorcycle.engine_size && (
                                            <div className="detail-item">
                                                <span className="detail-label">Engine:</span>
                                                <span className="detail-value">{motorcycle.engine_size} cc</span>
                                            </div>
                                        )}

                                        {motorcycle.mileage && (
                                            <div className="detail-item">
                                                <span className="detail-label">Mileage:</span>
                                                <span className="detail-value">
                                                    {motorcycle.mileage.toLocaleString()} {motorcycle.mileage_unit}
                                                </span>
                                            </div>
                                        )}

                                        {motorcycle.color && (
                                            <div className="detail-item">
                                                <span className="detail-label">Color:</span>
                                                <span className="detail-value">{motorcycle.color}</span>
                                            </div>
                                        )}

                                        {motorcycle.license_plate && (
                                            <div className="detail-item">
                                                <span className="detail-label">Plate:</span>
                                                <span className="detail-value">{motorcycle.license_plate}</span>
                                            </div>
                                        )}

                                        {motorcycle.condition && (
                                            <div className="detail-item">
                                                <span className="detail-label">Condition:</span>
                                                <span className={`condition-badge condition-${motorcycle.condition}`}>
                                                    {motorcycle.condition}
                                                </span>
                                            </div>
                                        )}

                                        {motorcycle.purchase_date && (
                                            <div className="detail-item">
                                                <span className="detail-label">Purchased:</span>
                                                <span className="detail-value">
                                                    {new Date(motorcycle.purchase_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        <div className="detail-item">
                                            <span className="detail-label">Status:</span>
                                            <span className="detail-value">
                                                {motorcycle.current_owner ? '✓ Current Owner' : 'Previous Owner'}
                                            </span>
                                        </div>

                                        {motorcycle.notes && (
                                            <div className="detail-item detail-notes">
                                                <span className="detail-label">Notes:</span>
                                                <span className="detail-value">{motorcycle.notes}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="motorcycle-actions">
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEdit(motorcycle)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="delete-button"
                                            onClick={() => handleDelete(motorcycle.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
