# Galvan AI - Full Stack User Management System

A comprehensive full-stack application for user and admin management with JWT authentication, OTP verification, and modern UI/UX.

##Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (Flask)       │◄──►│   (SQLite)      │
│   Port: 3000    │    │   Port: 5000    │    │   File: app.db  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### Prerequisites
- Python 3.8+ (for backend)
- Node.js 18+ (for frontend)
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd galvan-auth-master
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Login**: Use seeded credentials
- **User Login**: Create users through admin dashboard

##  Project Structure

```
galvan-auth/
├── backend/                 # Flask API Server
│   ├── app.py              # Main Flask application
│   ├── models.py           # Database models
│   ├── resources/          # API endpoints
│   ├── utils/              # Utility functions
│   ├── requirements.txt     # Python dependencies
│   ├── .env                # Environment variables
│   └── README.md           # Backend documentation
├── frontend/               # Next.js Application
│   ├── src/
│   │   ├── app/           # Next.js 14 App Router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   ├── package.json       # Node dependencies
│   ├── .env.local         # Environment variables
│   └── README.md          # Frontend documentation
└── README.md              # This file
```

## Features

### Authentication & Authorization
- **JWT-based Authentication**: Secure token-based auth
- **Role-based Access**: Admin and user roles
- **OTP Verification**: Email-based account verification
- **Session Management**: Persistent login sessions

### User Management
- **CRUD Operations**: Create, read, update, delete users
- **Profile Pictures**: Upload and display user avatars
- **Role Assignment**: USER, ADMIN roles


### Modern UI/UX
- **Responsive Design**: Mobile first approach
- **Toast Notifications**: Real-time user feedback
- **Modal Interfaces**: Clean popup forms
- **Professional Styling**: Tailwind CSS design system

### Technical Features
- **TypeScript**: Type safe development
- **API Integration**: RESTful API communication
- **File Upload**: Secure image handling
- **CORS Support**: Cross-origin resource sharing
- **Error Handling**: Comprehensive error management

## Technology Stack

### Backend
- **Flask**: Python web framework
- **SQLAlchemy**: Database ORM
- **JWT**: Token-based authentication
- **Flask-CORS**: Cross-origin support
- **SQLite**: Database

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management
- **Fetch API**: HTTP client

## User Interfaces

### Landing Page
- Welcome message and platform overview
- Separate login options for admin and users
- Auto redirect for authenticated users

### Admin Dashboard
- User management table with profile pictures
- Create user modal with OTP verification
- Edit/delete user functionality
- Role management and status updates

### User Dashboard
- Personal profile display
- Account information and status
- Profile picture display
- Logout functionality

## Configuration

### Backend Environment Variables
```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
FRONTEND_ORIGIN=http://localhost:3000
```

### Frontend Environment Variables
```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
NEXT_PUBLIC_DEMO_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_DEMO_ADMIN_PASSWORD=admin123
```

## Deployment

### Development
```bash
# Backend
cd backend
source venv/bin/activate
python app.py

# Frontend
cd frontend
npm run dev
```

### Production
```bash
# Backend
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Frontend
cd frontend
npm run build
npm run start
```

##  Testing

### Manual Testing
1. **Authentication Flow**
   - Admin login with seeded credentials
   - User login with created accounts
   - Logout functionality

2. **User Management**
   - Create new users with OTP verification
   - Edit user information and roles
   - Delete users
   - Upload profile pictures

3. **UI/UX Testing**
   - Toast notifications
   - Modal interactions
   - Responsive design
   - Error handling

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Admin login
curl -X POST http://localhost:5000/api/auth/admin-login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'
```

## Documentation

- **[Backend README](backend/README.md)**: Flask API documentation
- **[Frontend README](frontend/README.md)**: Next.js application documentation
- **API Endpoints**: Complete API reference
- **Database Schema**: Table structures and relationships

## Security

### Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- CORS configuration
- Input validation and sanitization

### Data Protection
- SQL injection prevention (ORM)
- XSS protection (React)
- File upload validation
- Environment variable security

## Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Database problems
rm instance/app.db
python -c "from app import app, db; app.app_context().push(); db.create_all()"

# Import errors
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend Issues
```bash
# Build problems
rm -rf node_modules package-lock.json
npm install
npm run build

# TypeScript errors
npx tsc --noEmit
```

#### Connection Issues
- Verify backend is running on port 5000
- Check frontend is running on port 3000
- Ensure CORS configuration is correct
- Verify environment variables



### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write reusable components
- Add proper error handling
- Document complex logic


