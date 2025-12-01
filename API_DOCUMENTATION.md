# API Documentation for Restore 360 Frontend

This document outlines the expected API endpoints and data structures for backend integration.

## Authentication

### Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin",
    "phone": "+1234567890",
    "department": "IT",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  },
  "token": "jwt_token_here",
  "refresh_token": "refresh_token_here"
}
```

### Get Current User
**GET** `/api/auth/me`

Headers: `Authorization: Bearer {token}`

Response: Same as user object above

### Logout
**POST** `/api/auth/logout`

Headers: `Authorization: Bearer {token}`

### Forgot Password
**POST** `/api/auth/forgot-password`

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "message": "Password reset email sent"
}
```

## Users

### List Users
**GET** `/api/users?page=1&limit=10&sort_by=created_at&sort_order=desc`

Response:
```json
{
  "data": [/* array of user objects */],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

### Get User
**GET** `/api/users/:id`

Response: User object

### Create User
**POST** `/api/users`

Request:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "role": "case_worker",
  "department": "Operations",
  "status": "active"
}
```

### Update User
**PUT** `/api/users/:id`

Request: Same as create

### Delete User
**DELETE** `/api/users/:id`

## Cases

### List Cases
**GET** `/api/cases?page=1&limit=10&status=open&priority=high`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "case_number": "CASE-2024-001",
      "title": "Case Title",
      "description": "Detailed description",
      "status": "open",
      "priority": "high",
      "assigned_to": "user_id",
      "assigned_user": {/* user object */},
      "created_by": "user_id",
      "creator": {/* user object */},
      "location": {
        "latitude": 0.0,
        "longitude": 0.0,
        "address": "123 Street"
      },
      "tags": ["tag1", "tag2"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

### Get Case
**GET** `/api/cases/:id`

Response: Case object

### Create Case
**POST** `/api/cases`

Request:
```json
{
  "case_number": "CASE-2024-001",
  "title": "Case Title",
  "description": "Description",
  "status": "open",
  "priority": "high",
  "assigned_to": "user_id"
}
```

### Update Case
**PUT** `/api/cases/:id`

Request: Same as create

### Assign Case
**POST** `/api/cases/:id/assign`

Request:
```json
{
  "user_id": "uuid"
}
```

### Update Case Status
**PATCH** `/api/cases/:id/status`

Request:
```json
{
  "status": "closed"
}
```

## Registrations

### List Registrations
**GET** `/api/registrations?page=1&limit=10&status=pending`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "id_number": "ID123",
      "address": "123 Street",
      "location": {
        "latitude": 0.0,
        "longitude": 0.0
      },
      "category": "emergency",
      "description": "Description",
      "attachments": [
        {
          "id": "uuid",
          "file_name": "document.pdf",
          "file_url": "https://...",
          "file_type": "application/pdf",
          "file_size": 12345,
          "uploaded_at": "2024-01-01T00:00:00Z"
        }
      ],
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 20,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

### Create Registration
**POST** `/api/registrations`

Content-Type: `multipart/form-data`

Form Data:
- `full_name`: string
- `email`: string (optional)
- `phone`: string
- `id_number`: string (optional)
- `address`: string
- `location`: JSON string `{"latitude": 0.0, "longitude": 0.0}`
- `category`: string
- `description`: string
- `attachments`: file[] (multiple files)

### Update Registration Status
**PATCH** `/api/registrations/:id/status`

Request:
```json
{
  "status": "approved"
}
```

## Referrals

### List Referrals
**GET** `/api/referrals?page=1&limit=10&status=pending`

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "case_id": "uuid",
      "referred_from": "user_id",
      "referred_to": "user_id",
      "from_user": {/* user object */},
      "to_user": {/* user object */},
      "reason": "Reason for referral",
      "notes": "Additional notes",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "total_pages": 2
}
```

### Create Referral
**POST** `/api/referrals`

Request:
```json
{
  "case_id": "uuid",
  "referred_from": "user_id",
  "referred_to": "user_id",
  "reason": "Reason",
  "notes": "Notes"
}
```

### Update Referral Status
**PATCH** `/api/referrals/:id/status`

Request:
```json
{
  "status": "accepted"
}
```

## Activity Logs

### Log Activity
**POST** `/api/activity`

Request:
```json
{
  "user_id": "uuid",
  "action": "create",
  "module": "cases",
  "description": "Created new case",
  "device_id": "device_123",
  "metadata": {
    "case_id": "uuid",
    "additional": "data"
  }
}
```

Response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "user": {/* user object */},
  "action": "create",
  "module": "cases",
  "description": "Created new case",
  "device_id": "device_123",
  "ip_address": "192.168.1.1",
  "metadata": {},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Get Activity Logs
**GET** `/api/activity?page=1&limit=10&user_id=uuid&module=cases`

Response: Paginated activity logs

## Reports

### Get Dashboard Stats
**GET** `/api/reports/dashboard`

Response:
```json
{
  "total_cases": 100,
  "open_cases": 50,
  "closed_cases": 30,
  "total_users": 25,
  "total_registrations": 75,
  "pending_referrals": 10,
  "recent_activity": [/* array of activity log objects */]
}
```

### Generate Report
**POST** `/api/reports/generate`

Request:
```json
{
  "report_type": "cases_summary",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

Response:
```json
{
  "id": "uuid",
  "report_type": "cases_summary",
  "generated_by": "user_id",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "data": {/* report data */},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Export Report
**POST** `/api/reports/export`

Request:
```json
{
  "report_type": "cases_summary",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "format": "pdf"
}
```

Response: Binary file (PDF/Excel/CSV)

Content-Type: `application/pdf` or `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` or `text/csv`

## Database Schema for Activity Logging

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL,
  phone VARCHAR(50),
  department VARCHAR(100),
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  device_id VARCHAR(100),
  ip_address VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_logs(user_id);
CREATE INDEX idx_activity_module ON user_activity_logs(module);
CREATE INDEX idx_activity_created ON user_activity_logs(created_at);
```

## Error Responses

All endpoints should return consistent error responses:

```json
{
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "error details"
  }
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer {jwt_token}
```

Tokens should be validated on each request and return 401 if expired or invalid.
