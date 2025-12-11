# Restore 360 - Frontend Application

A comprehensive case management system built with React, TypeScript, and modern web technologies.

## Features

- **Authentication System**: Secure login with email/password
- **Dashboard**: Overview of system statistics and recent activity
- **User Management**: Create, view, edit, and manage system users (Admin only)
- **Case Management**: Track and manage cases with status, priority, and assignments
- **Registrations**: Submit registrations with file attachments and location capture
- **Referrals**: Create and manage case referrals between users
- **Reports**: Generate and export reports in PDF, Excel, or CSV formats
- **Settings**: Manage profile, password, and notification preferences
- **Activity Logging**: Comprehensive tracking of all user actions across the system

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form management
- **Zod** - Validation
- **Lucide React** - Icons

## Project Structure

```
src/
├── api/              # API layer with Axios
├── components/       # Reusable components
│   ├── common/       # Common UI components
│   ├── forms/        # Form components
│   └── tables/       # Table components
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── layouts/          # Layout components
├── pages/            # Page components
├── types/            # TypeScript types
└── utils/            # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API server running (default: http://localhost:3000)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Key Features

### Activity Logging

Every user action is automatically tracked using the `useActivityLogger` hook:

```typescript
const { track } = useActivityLogger();
await track('create', 'cases', 'Created new case', { case_id: '123' });
```

Activity logs include:
- User ID
- Action type
- Module name
- Description
- Device ID
- Metadata
- Timestamp
- IP address (captured by backend)

### Protected Routes

Routes are protected using role-based access control:

```typescript
<ProtectedRoute allowedRoles={['admin']}>
  <UsersListPage />
</ProtectedRoute>
```

### Location Capture

Registrations include geolocation capture using the browser's Geolocation API.

### File Uploads

Support for multiple file uploads with preview and removal functionality.

## API Integration

The frontend expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Cases
- `GET /api/cases` - List cases
- `GET /api/cases/:id` - Get case details
- `POST /api/cases` - Create case
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### Registrations
- `GET /api/registrations` - List registrations
- `POST /api/registrations` - Create registration (multipart/form-data)

### Referrals
- `GET /api/referrals` - List referrals
- `POST /api/referrals` - Create referral
- `PUT /api/referrals/:id` - Update referral

### Activity Logs
- `POST /api/activity` - Log activity
- `GET /api/activity` - Get activity logs

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `POST /api/reports/generate` - Generate report
- `POST /api/reports/export` - Export report (returns blob)

## User Roles

- **Admin**: Full system access including user management
- **Case Worker**: Access to cases, reports, and referrals
- **Field Officer**: Access to cases and field operations
- **Viewer**: Read-only access to cases and reports

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

This is a production-ready application built with best practices:
- Clean architecture with separation of concerns
- Type-safe TypeScript throughout
- Reusable component library
- Comprehensive error handling
- Loading and empty states
- Responsive design
- Activity logging on all major actions

## License

Proprietary - All rights reserved
