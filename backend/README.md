# Galvan AI Backend API

A Flask-based REST API for user and admin management with JWT authentication, OTP verification, and file upload capabilities.

## Features

- **JWT Authentication**: Secure token-based authentication for users and admins
- **OTP Verification**: Email-based OTP verification for new user accounts
- **User Management**: CRUD operations for user accounts with role-based access
- **File Upload**: Profile picture upload with secure file handling
- **CORS Support**: Cross-origin resource sharing for frontend integration
- **Email Integration**: Automated email sending for OTP verification
- **Database**: SQLAlchemy ORM with SQLite database

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd backend
```

### 2. Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=sqlite:///instance/app.db

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600

# Email Configuration (for OTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:3000
BACKEND_HOST=0.0.0.0
BACKEND_PORT=5000

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,webp
```

### 5. Initialize Database
```bash
# Create database tables
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Seed initial data (optional)
python seed.py
```

## Running the Application

### Development Mode
```bash
# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows

# Run the application
python app.py
```

The API will be available at `http://localhost:5000`

### Production Mode
```bash
# Using gunicorn (recommended for production)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Admin Login
```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### User Login
```http
POST /api/auth/user-login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "user123"
}
```

#### User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

#### OTP Verification
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### User Management Endpoints

#### Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-jwt-token>
```

#### Create User
```http
POST /api/admin/users
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobileNumber": "+1234567890",
  "role": "USER",
  "profilePictureUrl": "/uploads/profile.jpg"
}
```

#### Update User
```http
PUT /api/admin/users/{user_id}
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "role": "ADMIN",
  "isActive": true,
  "isVerified": true
}
```

#### Delete User
```http
DELETE /api/admin/users/{user_id}
Authorization: Bearer <admin-jwt-token>
```

### File Upload Endpoints

#### Upload Profile Picture
```http
POST /api/upload/profile-picture
Content-Type: multipart/form-data

file: <image-file>
user_id: temp
```

#### Get Uploaded File
```http
GET /api/uploads/{filename}
```

## Database Schema

### Users Table
- `id`: Primary key
- `profile_picture_url`: Profile picture URL
- `first_name`: User's first name
- `last_name`: User's last name
- `email`: Unique email address
- `password_hash`: Hashed password
- `mobile_number`: Phone number
- `role`: User role (USER, ADMIN, MANAGER, SUPERVISOR)
- `is_active`: Account status
- `is_verified`: Email verification status
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Admins Table
- `id`: Primary key
- `email`: Admin email
- `password_hash`: Hashed password
- `created_at`: Creation timestamp

### EmailOTP Table
- `id`: Primary key
- `email`: Email address
- `otp_code`: 6-digit OTP code
- `purpose`: OTP purpose (admin_verification, etc.)
- `is_used`: Usage status
- `expires_at`: Expiration timestamp
- `created_at`: Creation timestamp

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Flask secret key | Required |
| `JWT_SECRET_KEY` | JWT signing key | Required |
| `MAIL_USERNAME` | Email username | Required for OTP |
| `MAIL_PASSWORD` | Email password | Required for OTP |
| `FRONTEND_ORIGIN` | Frontend URL | `http://localhost:3000` |
| `UPLOAD_FOLDER` | Upload directory | `uploads` |
| `MAX_CONTENT_LENGTH` | Max file size | `16MB` |

### CORS Configuration
The API is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `http://localhost:5000`
- `http://127.0.0.1:5000`

## Testing

### Manual Testing
Use tools like Postman or curl to test the API endpoints:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test admin login
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

### Database Testing
```bash
# Access database
sqlite3 instance/app.db

# View tables
.tables

# View users
SELECT * FROM users;

# Ex

## Dependencies

### Core Dependencies
- `Flask`: Web framework
- `Flask-SQLAlchemy`: Database ORM
- `Flask-JWT-Extended`: JWT authentication
- `Flask-CORS`: Cross-origin resource sharing
- `Werkzeug`: WSGI utilities

### Development Dependencies
- `python-dotenv`: Environment variable management
- `email-validator`: Email validation
- `passlib`: Password hashing

## Security Features

- **Password Hashing**: Secure password storage using bcrypt
- **JWT Tokens**: Stateless authentication
- **CORS Protection**: Configured cross-origin policies
- **File Validation**: Secure file upload with type checking
- **Input Validation**: Request data validation
- **SQL Injection Protection**: ORM-based queries

## Performance

- **Database Indexing**: Optimized queries
- **File Size Limits**: Configurable upload limits
- **Connection Pooling**: Efficient database connections
- **Caching**: JWT token caching

