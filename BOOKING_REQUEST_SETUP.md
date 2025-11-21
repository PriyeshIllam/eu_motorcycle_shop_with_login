# Booking Request Feature Setup Guide

This guide will help you set up the **Booking Request** feature for your EU Motorcycle Shop application. This feature allows users to request service appointments for their motorcycles.

## Overview

The Booking Request feature enables users to:
- Submit service/repair booking requests for their motorcycles
- Specify service type, urgency, and preferred date/time
- Provide detailed descriptions of what they need
- Track the status of their booking requests
- View all their past and current bookings

## Files Created

### 1. Database Schema
- **File**: `supabase_booking_requests_schema.sql`
- Contains the SQL schema for the `booking_requests` table with RLS policies

### 2. TypeScript Types
- **File**: `src/types/booking-request.ts`
- Defines TypeScript interfaces and types for booking requests

### 3. React Component
- **File**: `src/components/BookingRequest.tsx`
- Main component for the booking request feature

### 4. Styles
- **File**: `src/styles/booking-request.scss`
- SASS stylesheet for the booking request UI

### 5. Updated Files
- `src/components/App.tsx` - Added routing for booking request view
- `src/components/HomePage.tsx` - Added "Book Service" button
- `package.json` - Added booking-request.scss to build scripts
- `public/index.html` - Added booking-request.css stylesheet link

---

## Setup Instructions

### Step 1: Set Up the Database Table

1. **Copy the SQL schema**:
   - Open the file `supabase_booking_requests_schema.sql`
   - Copy the entire contents

2. **Run in Supabase**:
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Navigate to **SQL Editor** (left sidebar)
   - Click **"New Query"**
   - Paste the SQL schema
   - Click **"RUN"** or press `Ctrl+Enter` / `Cmd+Enter`

3. **Verify the setup**:
   ```sql
   -- Check if the table exists
   SELECT * FROM public.booking_requests LIMIT 1;

   -- Check RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'booking_requests';

   -- Check the view
   SELECT * FROM public.booking_requests_with_details LIMIT 1;
   ```

### Step 2: Build the Application

Run the build command to compile the new styles and JavaScript:

```bash
npm run build
```

This will:
- Compile `booking-request.scss` to CSS
- Bundle the TypeScript/React code including the new component

### Step 3: Test the Feature

1. **Start the development server**:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

2. **Navigate to the booking request page**:
   - Log in to your application
   - Click the **"📅 Book Service"** button on the homepage
   - You should see the booking request form

3. **Create a test booking**:
   - Select a motorcycle from your garage (add one if you haven't)
   - Fill in the service details
   - Submit the form
   - Verify the booking appears in the list below

---

## Database Schema Details

### Table: `booking_requests`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key to `auth.users` |
| `motorcycle_id` | UUID | Foreign key to `biker_motorcycles` |
| `service_type` | VARCHAR(100) | Type of service requested |
| `description` | TEXT | Detailed description of the service needed |
| `preferred_date` | DATE | User's preferred appointment date |
| `preferred_time` | TIME | User's preferred appointment time |
| `contact_phone` | VARCHAR(20) | Optional phone number |
| `contact_method` | VARCHAR(20) | Preferred contact method (email/phone/both) |
| `urgency` | VARCHAR(20) | Urgency level (low/normal/high/emergency) |
| `estimated_budget` | DECIMAL(10,2) | Optional estimated budget |
| `currency` | VARCHAR(3) | Currency code (default: EUR) |
| `status` | VARCHAR(20) | Booking status (pending/confirmed/in_progress/completed/cancelled) |
| `admin_notes` | TEXT | Notes from the shop (admin response) |
| `confirmed_date` | DATE | Confirmed appointment date (set by admin) |
| `confirmed_time` | TIME | Confirmed appointment time (set by admin) |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp (auto-updated) |

### Service Types Available

- Oil Change
- Tire Replacement
- Brake Service
- Chain Maintenance
- Engine Repair
- Electrical Work
- Bodywork/Paint
- General Maintenance
- Inspection
- Custom Modification
- Annual Service
- Emergency Repair
- Other

### Urgency Levels

- **Low**: Can wait a few weeks
- **Normal**: Within a week
- **High**: Within a few days
- **Emergency**: ASAP

### Booking Statuses

- **Pending**: Newly submitted, awaiting review
- **Confirmed**: Appointment confirmed by shop
- **In Progress**: Service is currently being performed
- **Completed**: Service completed
- **Cancelled**: Booking cancelled

---

## Row Level Security (RLS) Policies

The following RLS policies are automatically created:

1. **View Own Bookings**: Users can only see their own booking requests
2. **Create Bookings**: Authenticated users can create booking requests
3. **Update Own Bookings**: Users can update their pending/confirmed bookings
4. **Delete Pending Bookings**: Users can delete their pending booking requests

These policies ensure data privacy and security.

---

## API Usage Examples

### Create a Booking Request

```typescript
const { data, error } = await supabase
  .from('booking_requests')
  .insert([{
    user_id: userId,
    motorcycle_id: motorcycleId,
    service_type: 'oil_change',
    description: 'Need oil change and filter replacement',
    preferred_date: '2024-03-15',
    preferred_time: '10:00',
    contact_method: 'email',
    urgency: 'normal',
    currency: 'EUR'
  }])
  .select()
  .single();
```

### Fetch User's Bookings

```typescript
const { data, error } = await supabase
  .from('booking_requests_with_details')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

### Update Booking Status

```typescript
const { data, error } = await supabase
  .from('booking_requests')
  .update({ status: 'cancelled' })
  .eq('id', bookingId);
```

### Delete a Booking

```typescript
const { data, error } = await supabase
  .from('booking_requests')
  .delete()
  .eq('id', bookingId);
```

---

## User Interface

### Homepage
- Added a **"📅 Book Service"** button in the navigation controls
- Positioned between the filters and "My Garage" button

### Booking Request Page

**Form Section**:
- Motorcycle selection dropdown (populated from user's garage)
- Service type dropdown
- Description textarea (minimum 10 characters required)
- Preferred date and time pickers
- Urgency level selector
- Contact method selector (email/phone/both)
- Phone number field (shown if phone contact selected)
- Optional estimated budget input
- Currency selector (EUR/USD/GBP/CHF)

**Bookings List**:
- Displays all user's booking requests
- Shows status badges (color-coded)
- Shows urgency badges
- Displays motorcycle details
- Shows preferred and confirmed date/time
- Shows shop response notes (if any)
- Action buttons for pending bookings (Cancel/Delete)

---

## Styling

The booking request feature follows the same design system as the rest of the application:

- **Primary Color**: Orange (#ff6b00)
- **Status Colors**: Color-coded badges for different statuses
- **Urgency Colors**: Visual indicators for urgency levels
- **Responsive Design**: Mobile-friendly layout
- **Animations**: Smooth transitions and slide-in effects

---

## Admin Features (Future Enhancement)

The database schema supports admin features that can be added later:

1. **Admin Dashboard**: View all pending booking requests
2. **Status Management**: Update booking status
3. **Date Confirmation**: Set confirmed appointment dates/times
4. **Admin Notes**: Add notes/responses to bookings
5. **Email Notifications**: Send confirmation emails (requires additional setup)

---

## Troubleshooting

### Issue: Table creation fails

**Solution**: Make sure your Supabase project has the `biker_motorcycles` table already created, as `booking_requests` has a foreign key dependency on it.

### Issue: Bookings not appearing

**Solution**:
1. Check the browser console for errors
2. Verify RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'booking_requests'`
3. Ensure the user has motorcycles in their garage

### Issue: CSS not loading

**Solution**:
1. Run `npm run build` to compile the SCSS
2. Check that `public/css/booking-request.css` exists
3. Verify the stylesheet link in `public/index.html`

### Issue: TypeScript errors

**Solution**:
1. Ensure all type files are in `src/types/`
2. Run `npm run build:js` to check for compilation errors
3. Make sure `BikerMotorcycle` type is imported correctly

---

## Next Steps

After setting up the booking request feature, you might want to:

1. **Add Email Notifications**: Integrate with SendGrid or similar service
2. **Create Admin Dashboard**: Build an admin interface to manage bookings
3. **Add Shop Selection**: Allow users to select which shop they want to book with
4. **Implement Calendar View**: Show bookings in a calendar interface
5. **Add SMS Notifications**: Integrate with Twilio for SMS reminders
6. **Export Functionality**: Allow users to export their booking history

---

## Support

If you encounter any issues or have questions:

1. Check the Supabase logs in the Dashboard
2. Review the browser console for errors
3. Verify all environment variables are set correctly
4. Ensure your Supabase project has sufficient resources

---

## Summary

You've successfully set up the Booking Request feature! Users can now:

✅ Request service appointments for their motorcycles
✅ Specify service details and urgency
✅ Track booking status
✅ Manage their booking requests
✅ View all their past and current bookings

The feature is fully integrated with your existing authentication and motorcycle management system.
