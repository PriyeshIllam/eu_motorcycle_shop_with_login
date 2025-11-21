// Type definitions for biker motorcycles

export interface BikerMotorcycle {
    id: string;
    user_id: string;
    brand: string;
    model: string;
    year: number;
    mileage: number | null;
    mileage_unit: 'km' | 'miles';
    engine_size: number | null;
    color: string | null;
    license_plate: string | null;
    vin: string | null;
    purchase_date: string | null;
    current_owner: boolean;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface MotorcycleFormData {
    brand: string;
    model: string;
    year: string;
    mileage: string;
    mileage_unit: 'km' | 'miles';
    engine_size: string;
    color: string;
    license_plate: string;
    vin: string;
    purchase_date: string;
    current_owner: boolean;
    condition: 'excellent' | 'good' | 'fair' | 'poor' | '';
    notes: string;
}

export const MOTORCYCLE_BRANDS = [
    'Aprilia',
    'BMW',
    'Benelli',
    'Ducati',
    'Harley-Davidson',
    'Honda',
    'Husqvarna',
    'Indian',
    'Kawasaki',
    'KTM',
    'Moto Guzzi',
    'MV Agusta',
    'Royal Enfield',
    'Suzuki',
    'Triumph',
    'Yamaha',
    'Other'
];
