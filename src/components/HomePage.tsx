import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { MotorcycleShop, ShopFilters, ShopStats } from '../types/motorcycle-shop';

const PAGE_SIZE = 50;

interface HomePageProps {
    onLogout?: () => void;
    onViewProfile?: () => void;
    onViewBookingRequest?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onLogout, onViewProfile, onViewBookingRequest }) => {
    const [shops, setShops] = useState<MotorcycleShop[]>([]);
    const [displayedShops, setDisplayedShops] = useState<MotorcycleShop[]>([]);
    const [stats, setStats] = useState<ShopStats>({
        totalShops: 0,
        totalCountries: 0,
        visibleShops: 0
    });
    const [countries, setCountries] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [filters, setFilters] = useState<ShopFilters>({
        search: '',
        country: '',
        city: '',
        rating: ''
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    // Load statistics
    const loadStats = useCallback(async () => {
        try {
            // Get total count
            const { count, error: countError } = await supabase
                .from('motorcycle_shops')
                .select('*', { count: 'exact', head: true });

            if (countError) throw countError;

            // Fetch countries in chunks
            const chunkSize = 1000;
            let offset = 0;
            let allCountries: string[] = [];

            while (true) {
                const { data, error: countriesError } = await supabase
                    .from('motorcycle_shops')
                    .select('country')
                    .order('country')
                    .range(offset, offset + chunkSize - 1);

                if (countriesError) throw countriesError;
                if (!data || data.length === 0) break;

                allCountries = allCountries.concat(data.map((c: { country: string }) => c.country));
                offset += chunkSize;
            }

            const uniqueCountries = [...new Set(allCountries)];

            setStats({
                totalShops: count || 0,
                totalCountries: uniqueCountries.length,
                visibleShops: 0
            });
        } catch (err) {
            console.error('Error loading stats:', err);
            setError(err instanceof Error ? err.message : 'Failed to load statistics');
        }
    }, []);

    // Load countries for filter
    const loadCountries = useCallback(async () => {
        try {
            const { data, error: countriesError } = await supabase
                .rpc('get_distinct_countries');

            if (countriesError) throw countriesError;

            const uniqueCountries = [...new Set(data.map((s: { country: string }) => s.country))];
            setCountries(uniqueCountries);
        } catch (err) {
            console.error('Error loading countries:', err);
            // Fallback: Load countries from shops table
            try {
                const { data, error: fallbackError } = await supabase
                    .from('motorcycle_shops')
                    .select('country')
                    .order('country')
                    .limit(1000);

                if (fallbackError) throw fallbackError;

                const uniqueCountries = [...new Set(data.map((s: { country: string }) => s.country))];
                setCountries(uniqueCountries);
            } catch (fallbackErr) {
                console.error('Fallback error loading countries:', fallbackErr);
            }
        }
    }, []);

    // Load cities based on selected country
    const loadCities = useCallback(async (country: string) => {
        if (!country) {
            setCities([]);
            return;
        }

        try {
            const { data, error: citiesError } = await supabase
                .from('motorcycle_shops')
                .select('city')
                .eq('country', country)
                .order('city');

            if (citiesError) throw citiesError;

            const uniqueCities = [...new Set(data.map((s: { city: string }) => s.city))];
            setCities(uniqueCities);
        } catch (err) {
            console.error('Error loading cities:', err);
        }
    }, []);

    // Load shops with filters
    const loadShops = useCallback(async (append: boolean = false) => {
        try {
            setLoading(true);
            const page = append ? currentPage + 1 : 0;

            let query = supabase
                .from('motorcycle_shops')
                .select('*')
                .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

            if (filters.search) {
                query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,address.ilike.%${filters.search}%`);
            }

            if (filters.country) {
                query = query.eq('country', filters.country);
            }

            if (filters.city) {
                query = query.eq('city', filters.city);
            }

            if (filters.rating) {
                query = query.gte('rating', parseFloat(filters.rating));
            }

            query = query.order('country').order('city').order('name');

            const { data, error: shopsError } = await query;

            if (shopsError) throw shopsError;

            const newShops = data as MotorcycleShop[];

            if (append) {
                setDisplayedShops(prev => [...prev, ...newShops]);
                setCurrentPage(page);
            } else {
                setDisplayedShops(newShops);
                setCurrentPage(0);
            }

            setHasMore(newShops.length === PAGE_SIZE);
            setStats(prev => ({
                ...prev,
                visibleShops: append ? prev.visibleShops + newShops.length : newShops.length
            }));
            setError(null);
        } catch (err) {
            console.error('Error loading shops:', err);
            setError(err instanceof Error ? err.message : 'Failed to load shops');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters]);

    // Initialize
    useEffect(() => {
        const init = async () => {
            await loadStats();
            await loadCountries();
            await loadShops();
        };
        init();
    }, []);

    // Reload shops when filters change
    useEffect(() => {
        loadShops();
    }, [filters.search, filters.country, filters.city, filters.rating]);

    // Load cities when country changes
    useEffect(() => {
        loadCities(filters.country);
    }, [filters.country, loadCities]);

    const handleLoadMore = () => {
        loadShops(true);
    };

    const handleFilterChange = (key: keyof ShopFilters, value: string) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };

            // Reset city when country changes
            if (key === 'country') {
                newFilters.city = '';
            }

            return newFilters;
        });
    };

    const escapeHtml = (text: string | null): string => {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    const getGoogleMapsUrl = (shop: MotorcycleShop): string => {
        // Priority 1: Use place_id if available (most accurate)
        if (shop.place_id) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.name)}&query_place_id=${encodeURIComponent(shop.place_id)}`;
        }

        // Priority 2: Use latitude and longitude if available
        if (shop.latitude && shop.longitude) {
            return `https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`;
        }

        // Priority 3: Fallback to address-based search
        const searchQuery = [
            shop.name,
            shop.address,
            shop.city,
            shop.country
        ].filter(Boolean).join(', ');

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
    };

    return (
        <div className="homepage-container">
            <header className="homepage-header">
                <h1>🏍️ EU Motorcycle Repair Directory</h1>
                <p>Find motorcycle repair shops across Europe</p>
                <div className="powered-by">⚡ Powered by Supabase</div>
                <div className="stats">
                    <div className="stat-item">
                        <span className="stat-number">{stats.totalShops.toLocaleString()}</span>
                        <span className="stat-label">Repair Shops</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.totalCountries}</span>
                        <span className="stat-label">Countries</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">{stats.visibleShops.toLocaleString()}</span>
                        <span className="stat-label">Showing</span>
                    </div>
                </div>
            </header>

            <div className="controls">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, city, or address..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
                <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                >
                    <option value="">All Cities</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                    <option value="">All Ratings</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                </select>
                {onViewBookingRequest && (
                    <button className="booking-request-button" onClick={onViewBookingRequest}>
                        📅 Book Service
                    </button>
                )}
                {onViewProfile && (
                    <button className="profile-button" onClick={onViewProfile}>
                        My Garage
                    </button>
                )}
                {onLogout && (
                    <button className="logout-button" onClick={onLogout}>
                        Logout
                    </button>
                )}
            </div>

            <div className="content">
                {error && (
                    <div className="error-message">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {loading && currentPage === 0 ? (
                    <div className="loading">Loading motorcycle shops...</div>
                ) : displayedShops.length === 0 ? (
                    <div className="no-results">No shops found matching your criteria.</div>
                ) : (
                    <div className="shops-grid">
                        {displayedShops.map(shop => (
                            <div key={shop.id} className="shop-card">
                                <div className="shop-name" dangerouslySetInnerHTML={{ __html: escapeHtml(shop.name) }} />
                                <div className="shop-location">
                                    📍 {escapeHtml(shop.city)}, {escapeHtml(shop.country)}
                                </div>

                                {shop.address && (
                                    <div className="shop-info">
                                        <span className="icon">🏠</span>
                                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(shop.address) }} />
                                    </div>
                                )}

                                {shop.phone && (
                                    <div className="shop-info">
                                        <span className="icon">📞</span>
                                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(shop.phone) }} />
                                    </div>
                                )}

                                {shop.hours && (
                                    <div className="shop-info">
                                        <span className="icon">🕐</span>
                                        <span dangerouslySetInnerHTML={{ __html: escapeHtml(shop.hours) }} />
                                    </div>
                                )}

                                {shop.rating && (
                                    <div className="shop-rating">
                                        <span className="star">⭐</span>
                                        {shop.rating} ({shop.reviews_count} reviews)
                                    </div>
                                )}

                                <div className="shop-actions">
                                    <a
                                        href={getGoogleMapsUrl(shop)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="google-maps-button"
                                    >
                                        📍 Google Map
                                    </a>
                                    {shop.website && (
                                        <a
                                            href={escapeHtml(shop.website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="shop-website"
                                        >
                                            Visit Website →
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {hasMore && !loading && (
                    <div className="load-more">
                        <button onClick={handleLoadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
