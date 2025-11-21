import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BikerMotorcycle } from '../types/biker-motorcycle';
import {
    ServiceDocument,
    ServiceDocumentFormData,
    DocumentType,
    ServiceType,
    SERVICE_TYPE_LABELS,
    DOCUMENT_TYPE_LABELS
} from '../types/service-document';

interface ServiceDocumentsProps {
    motorcycle: BikerMotorcycle;
    onBack: () => void;
}

export const ServiceDocuments: React.FC<ServiceDocumentsProps> = ({ motorcycle, onBack }) => {
    const [documents, setDocuments] = useState<ServiceDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [formData, setFormData] = useState<ServiceDocumentFormData>({
        title: '',
        description: '',
        document_type: '',
        service_type: '',
        service_date: '',
        service_mileage: '',
        service_provider: '',
        cost: '',
        currency: 'EUR',
        tags: ''
    });

    useEffect(() => {
        loadDocuments();
    }, [motorcycle.id]);

    const loadDocuments = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('service_documents')
                .select('*')
                .eq('motorcycle_id', motorcycle.id)
                .order('service_date', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setDocuments(data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading documents:', err);
            setError(err instanceof Error ? err.message : 'Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            document_type: '',
            service_type: '',
            service_date: '',
            service_mileage: '',
            service_provider: '',
            cost: '',
            currency: 'EUR',
            tags: ''
        });
        setSelectedFile(null);
        setShowUploadForm(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
            setError(null);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a file to upload');
            return;
        }

        if (!formData.title.trim()) {
            setError('Please enter a title');
            return;
        }

        if (!formData.document_type) {
            setError('Please select a document type');
            return;
        }

        setUploadLoading(true);
        setError(null);

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Generate unique file name
            const fileExt = selectedFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${user.id}/${motorcycle.id}/${fileName}`;

            // Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('service-documents')
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Parse tags
            const tags = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            // Insert document metadata
            const { error: insertError } = await supabase
                .from('service_documents')
                .insert([{
                    user_id: user.id,
                    motorcycle_id: motorcycle.id,
                    document_type: formData.document_type,
                    title: formData.title.trim(),
                    description: formData.description.trim() || null,
                    service_type: formData.service_type || null,
                    service_date: formData.service_date || null,
                    service_mileage: formData.service_mileage ? parseInt(formData.service_mileage) : null,
                    service_provider: formData.service_provider.trim() || null,
                    cost: formData.cost ? parseFloat(formData.cost) : null,
                    currency: formData.currency,
                    file_path: filePath,
                    file_name: selectedFile.name,
                    file_size: selectedFile.size,
                    file_type: selectedFile.type,
                    tags: tags.length > 0 ? tags : null,
                    is_favorite: false
                }]);

            if (insertError) {
                // If insert fails, delete the uploaded file
                await supabase.storage.from('service-documents').remove([filePath]);
                throw insertError;
            }

            await loadDocuments();
            resetForm();
        } catch (err) {
            console.error('Error uploading document:', err);
            setError(err instanceof Error ? err.message : 'Failed to upload document');
        } finally {
            setUploadLoading(false);
        }
    };

    const handleDelete = async (document: ServiceDocument) => {
        if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
            return;
        }

        try {
            // Delete file from storage
            const { error: storageError } = await supabase.storage
                .from('service-documents')
                .remove([document.file_path]);

            if (storageError) throw storageError;

            // Delete metadata from database
            const { error: deleteError } = await supabase
                .from('service_documents')
                .delete()
                .eq('id', document.id);

            if (deleteError) throw deleteError;

            await loadDocuments();
        } catch (err) {
            console.error('Error deleting document:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete document');
        }
    };

    const handleDownload = async (document: ServiceDocument) => {
        try {
            const { data, error } = await supabase.storage
                .from('service-documents')
                .download(document.file_path);

            if (error) throw error;

            // Create download link
            const url = URL.createObjectURL(data);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.file_name;
            window.document.body.appendChild(a);
            a.click();
            window.document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading document:', err);
            setError(err instanceof Error ? err.message : 'Failed to download document');
        }
    };

    const getFileIcon = (fileType: string | null) => {
        if (!fileType) return '📄';
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📕';
        return '📄';
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const totalCost = documents.reduce((sum, doc) => sum + (doc.cost || 0), 0);

    return (
        <div className="service-documents-container">
            <header className="service-documents-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Garage
                </button>
                <div className="header-content">
                    <h1>📋 Service Documents</h1>
                    <h2>{motorcycle.brand} {motorcycle.model} ({motorcycle.year})</h2>
                </div>
                <div className="header-stats">
                    <div className="stat">
                        <span className="stat-value">{documents.length}</span>
                        <span className="stat-label">Documents</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">€{totalCost.toFixed(2)}</span>
                        <span className="stat-label">Total Cost</span>
                    </div>
                </div>
            </header>

            {error && (
                <div className="error-message">
                    <strong>Error:</strong> {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="upload-section">
                {!showUploadForm ? (
                    <button
                        className="upload-button"
                        onClick={() => setShowUploadForm(true)}
                    >
                        + Upload Document / Photo
                    </button>
                ) : (
                    <div className="upload-form-container">
                        <h3>Upload New Document</h3>
                        <form onSubmit={handleUpload} className="upload-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="file">
                                        File <span className="required">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={handleFileSelect}
                                        accept="image/*,.pdf,.doc,.docx"
                                        required
                                    />
                                    {selectedFile && (
                                        <span className="file-info">
                                            {selectedFile.name} ({formatFileSize(selectedFile.size)})
                                        </span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="document_type">
                                        Document Type <span className="required">*</span>
                                    </label>
                                    <select
                                        id="document_type"
                                        name="document_type"
                                        value={formData.document_type}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select Type</option>
                                        {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="title">
                                        Title <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Oil Change - March 2024"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="service_type">Service Type</label>
                                    <select
                                        id="service_type"
                                        name="service_type"
                                        value={formData.service_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select Service Type</option>
                                        {Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="service_date">Service Date</label>
                                    <input
                                        type="date"
                                        id="service_date"
                                        name="service_date"
                                        value={formData.service_date}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="service_mileage">Mileage at Service</label>
                                    <input
                                        type="number"
                                        id="service_mileage"
                                        name="service_mileage"
                                        value={formData.service_mileage}
                                        onChange={handleInputChange}
                                        min="0"
                                        placeholder="e.g., 15000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="service_provider">Service Provider</label>
                                    <input
                                        type="text"
                                        id="service_provider"
                                        name="service_provider"
                                        value={formData.service_provider}
                                        onChange={handleInputChange}
                                        placeholder="Shop or mechanic name"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="cost">Cost</label>
                                    <div className="cost-input-group">
                                        <input
                                            type="number"
                                            id="cost"
                                            name="cost"
                                            value={formData.cost}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                        <select
                                            name="currency"
                                            value={formData.currency}
                                            onChange={handleInputChange}
                                        >
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tags">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="e.g., maintenance, urgent, warranty"
                                    />
                                </div>
                            </div>

                            <div className="form-group form-group-full">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Additional notes about this service..."
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="submit-button"
                                    disabled={uploadLoading}
                                >
                                    {uploadLoading ? 'Uploading...' : 'Upload Document'}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={resetForm}
                                    disabled={uploadLoading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <div className="documents-list">
                {loading ? (
                    <div className="loading">Loading documents...</div>
                ) : documents.length === 0 ? (
                    <div className="no-documents">
                        <p>📭 No documents uploaded yet</p>
                        <p>Upload photos, invoices, and service records to keep track of your motorcycle's history.</p>
                    </div>
                ) : (
                    <div className="documents-grid">
                        {documents.map(document => (
                            <div key={document.id} className="document-card">
                                <div className="document-icon">
                                    {getFileIcon(document.file_type)}
                                </div>
                                <div className="document-content">
                                    <h3>{document.title}</h3>
                                    <span className="document-type-badge">
                                        {DOCUMENT_TYPE_LABELS[document.document_type]}
                                    </span>

                                    {document.service_type && (
                                        <div className="document-detail">
                                            <strong>Service:</strong> {SERVICE_TYPE_LABELS[document.service_type]}
                                        </div>
                                    )}

                                    {document.service_date && (
                                        <div className="document-detail">
                                            <strong>Date:</strong> {new Date(document.service_date).toLocaleDateString()}
                                        </div>
                                    )}

                                    {document.service_mileage && (
                                        <div className="document-detail">
                                            <strong>Mileage:</strong> {document.service_mileage.toLocaleString()} km
                                        </div>
                                    )}

                                    {document.service_provider && (
                                        <div className="document-detail">
                                            <strong>Provider:</strong> {document.service_provider}
                                        </div>
                                    )}

                                    {document.cost && (
                                        <div className="document-detail document-cost">
                                            <strong>Cost:</strong> {document.currency} {document.cost.toFixed(2)}
                                        </div>
                                    )}

                                    {document.description && (
                                        <div className="document-description">
                                            {document.description}
                                        </div>
                                    )}

                                    {document.tags && document.tags.length > 0 && (
                                        <div className="document-tags">
                                            {document.tags.map((tag, index) => (
                                                <span key={index} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="document-meta">
                                        <span>{document.file_name}</span>
                                        <span>{formatFileSize(document.file_size)}</span>
                                    </div>
                                </div>

                                <div className="document-actions">
                                    <button
                                        className="download-button"
                                        onClick={() => handleDownload(document)}
                                        title="Download"
                                    >
                                        ⬇
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDelete(document)}
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
