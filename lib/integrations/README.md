# Cavaly API Integrations

This directory contains all the API integration code for Cavaly's advanced features.

## Features Implemented

### 1. Budget - OCR & Receipt Parsing
- **Endpoint**: `POST /api/ocr/receipt`
- **Description**: Upload receipt images for automatic parsing
- **Tech**: Tesseract.js (free, local OCR)
- **Returns**: Extracted date, total, tax, merchant, line items

### 2. Health - Google Calendar Integration
- **Endpoints**: 
  - `GET /api/calendar/oauth/start` - Start OAuth flow
  - `GET /api/calendar/oauth/callback` - Handle OAuth callback
  - `POST /api/calendar/events` - Create calendar event
- **Description**: Sync health appointments to Google Calendar
- **Tech**: Google Calendar API v3

### 3. Health - Notifications
- **Endpoint**: `POST /api/notify/test`
- **Description**: Send email/SMS reminders
- **Tech**: Resend (email), Twilio (SMS)
- **Config**: Set `RESEND_API_KEY`, `TWILIO_*` env vars

### 4. Health - SIRE/Registry Lookup
- **Endpoint**: `GET /api/registry/lookup?sire=XXX&ueln=YYY`
- **Description**: Look up official horse data from national registry
- **Tech**: Local database synced with SIRE/IFCE data

### 5. Health - Share & Export
- **Endpoints**:
  - `POST /api/health/share` - Generate shareable link with QR code
  - `GET /api/health/export/xlsx?horseId=XXX` - Export to Excel
- **Description**: Share health records securely, export to Excel/PDF

### 6. Training - GPS Tracking
- **Endpoints**:
  - `POST /api/training/start` - Start live session
  - `POST /api/training/:id/points` - Add GPS points
  - `POST /api/training/:id/stop` - Stop and calculate stats
  - `GET /api/training/:id/gpx` - Export as GPX
- **Description**: Track rides with GPS, detect gaits, export routes
- **Tech**: MapLibre GL, OpenStreetMap, custom gait detection

### 7. Training - Gait Detection
- **Module**: `lib/integrations/gait-detector.ts`
- **Description**: Automatically detect walk/trot/canter/gallop from speed
- **Tech**: EMA smoothing + threshold-based classification

### 8. Training - Wearables (Future)
- **Description**: Apple Watch (HealthKit) & Android Wear integration
- **Status**: Infrastructure ready, needs mobile app implementation

## Environment Variables Required

\`\`\`env
# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=

# Notifications
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
\`\`\`

## Database Setup

Run the SQL migration:
\`\`\`bash
# Execute scripts/create-integration-tables.sql in your Supabase dashboard
\`\`\`

## Usage Examples

### OCR Receipt
\`\`\`typescript
const formData = new FormData()
formData.append('file', receiptImage)
const res = await fetch('/api/ocr/receipt', {
  method: 'POST',
  body: formData
})
const { parsed } = await res.json()
\`\`\`

### Start GPS Tracking
\`\`\`typescript
// Start session
const { id } = await fetch('/api/training/start', {
  method: 'POST',
  body: JSON.stringify({ horseId, type: 'trail' })
}).then(r => r.json())

// Add points periodically
await fetch(`/api/training/${id}/points`, {
  method: 'POST',
  body: JSON.stringify({
    points: [{ lat, lon, time, speed }]
  })
})

// Stop and get stats
const { stats } = await fetch(`/api/training/${id}/stop`, {
  method: 'POST'
}).then(r => r.json())
\`\`\`

### Share Health Record
\`\`\`typescript
const { url, qrUrl } = await fetch('/api/health/share', {
  method: 'POST',
  body: JSON.stringify({ horseId, expiresInHours: 72 })
}).then(r => r.json())
\`\`\`

## Next Steps

1. **Mobile App**: Implement native GPS tracking and wearable integration
2. **OCR Enhancement**: Integrate cloud OCR (Google Vision, AWS Textract) for better accuracy
3. **AI Features**: Add predictive analytics, chatbot assistant
4. **More Integrations**: Strava sync, FEI data, weather API
