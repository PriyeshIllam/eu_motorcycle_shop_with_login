export interface MotorcycleShop {
    id: number;
    name: string;
    country: string;
    city: string;
    address: string | null;
    phone: string | null;
    website: string | null;
    hours: string | null;
    rating: number | null;
    reviews_count: number | null;
    latitude: number | null;
    longitude: number | null;
    place_id: string | null;
}

export interface ShopFilters {
    search: string;
    country: string;
    city: string;
    rating: string;
}

export interface ShopStats {
    totalShops: number;
    totalCountries: number;
    visibleShops: number;
}
