// Type definitions for booking requests

export type ServiceType =
  | 'oil_change'
  | 'tire_replacement'
  | 'brake_service'
  | 'chain_maintenance'
  | 'engine_repair'
  | 'electrical'
  | 'bodywork'
  | 'general_maintenance'
  | 'inspection'
  | 'custom_modification'
  | 'annual_service'
  | 'emergency_repair'
  | 'other';

export type UrgencyLevel = 'low' | 'normal' | 'high' | 'emergency';

export type ContactMethod = 'email' | 'phone' | 'both';

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export interface BookingRequest {
  id: string;
  user_id: string;
  motorcycle_id: string;
  service_type: string;
  description: string;
  preferred_date: string; // ISO date string
  preferred_time: string; // HH:mm format
  contact_phone?: string;
  contact_method: ContactMethod;
  urgency: UrgencyLevel;
  estimated_budget?: number;
  currency: string;
  status: BookingStatus;
  admin_notes?: string;
  confirmed_date?: string;
  confirmed_time?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequestFormData {
  motorcycle_id: string;
  service_type: string;
  description: string;
  preferred_date: string;
  preferred_time: string;
  contact_phone: string;
  contact_method: ContactMethod;
  urgency: UrgencyLevel;
  estimated_budget: string;
  currency: string;
}

export interface BookingRequestWithDetails extends BookingRequest {
  brand?: string;
  model?: string;
  year?: number;
  license_plate?: string;
  mileage?: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  oil_change: 'Oil Change',
  tire_replacement: 'Tire Replacement',
  brake_service: 'Brake Service',
  chain_maintenance: 'Chain Maintenance',
  engine_repair: 'Engine Repair',
  electrical: 'Electrical Work',
  bodywork: 'Bodywork/Paint',
  general_maintenance: 'General Maintenance',
  inspection: 'Inspection',
  custom_modification: 'Custom Modification',
  annual_service: 'Annual Service',
  emergency_repair: 'Emergency Repair',
  other: 'Other'
};

export const URGENCY_LABELS: Record<UrgencyLevel, string> = {
  low: 'Low - Can wait a few weeks',
  normal: 'Normal - Within a week',
  high: 'High - Within a few days',
  emergency: 'Emergency - ASAP'
};

export const CONTACT_METHOD_LABELS: Record<ContactMethod, string> = {
  email: 'Email',
  phone: 'Phone',
  both: 'Email & Phone'
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending Review',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};
