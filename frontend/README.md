# Galvan AI Frontend

A modern Next.js 14 application with TypeScript, Tailwind CSS, and comprehensive user management features.

## Features

- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **User Authentication**: Admin and user login with JWT tokens
- **User Management**: Complete CRUD operations for user accounts
- **Profile Pictures**: Upload and display user profile pictures
- **OTP Verification**: Email-based OTP verification system
- **Toast Notifications**: Real-time feedback for all user actions
- **Role-Based Access**: Different interfaces for admins and users
- **Responsive Design**: Mobile-first, works on all devices

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:5000/api

# Demo Credentials (optional)
NEXT_PUBLIC_DEMO_ADMIN_EMAIL=admin@example.com
NEXT_PUBLIC_DEMO_ADMIN_PASSWORD=admin123
```

### 4. Start Development Server
```bash
# Using npm
npm run dev

# Using yarn
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── admin/             # Admin dashboard
│   │   ├── admin-login/       # Admin login page
│   │   ├── user-login/        # User login page
│   │   ├── dashboard/         # User dashboard
│   │   ├── register/          # User registration
│   │   ├── verify/            # OTP verification
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI components
│   ├── hooks/                 # Custom React hooks
│   └── lib/                   # Utility functions
├── public/                     # Static assets
├── tailwind.config.ts         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

## UI Components

### Core Components
- **Button**: Customizable button with loading states
- **Input**: Form input with validation
- **Card**: Content containers with headers
- **Alert**: Success, error, and info messages
- **Toast**: Notification system
- **Label**: Form labels

### Authentication Components
- **AdminLoginModal**: Admin login modal
- **OTPVerificationModal**: OTP verification popup

### Layout Components
- **Navbar**: Navigation bar with logout functionality

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.ts`:

```typescript
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

### TypeScript
TypeScript configuration in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Pages and Routes

### Public Routes
- `/` - Landing page with login options
- `/admin-login` - Admin login page
- `/user-login` - User login page
- `/register` - User registration page
- `/verify` - OTP verification page

### Protected Routes
- `/admin` - Admin dashboard (requires admin login)
- `/dashboard` - User dashboard (requires user login)

### Authentication Flow
1. **Landing Page**: Choose admin or user login
2. **Login**: Enter credentials
3. **Dashboard**: Access role-specific interface
4. **Logout**: Return to landing page

## Authentication

### JWT Token Management
```typescript
// Token storage in localStorage
localStorage.setItem('role', userRole);
localStorage.setItem('type', userType);

// API requests with credentials
fetch('/api/endpoint', {
  credentials: 'include',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Protected Routes
```typescript
// Check authentication status
useEffect(() => {
  const type = localStorage.getItem('type');
  const role = localStorage.getItem('role');
  
  if (!type || !role) {
    router.replace('/');
  }
}, []);
```

## Features by Page

### Landing Page (`/`)
- **Welcome Section**: Platform introduction
- **Login Options**: Separate cards for admin and user access
- **Features Section**: Platform capabilities overview
- **Auto-redirect**: Redirects logged-in users to appropriate dashboard

### Admin Dashboard (`/admin`)
- **User Management**: Create, read, update, delete users
- **Profile Pictures**: Upload and display user avatars
- **OTP Verification**: Email verification for new users
- **Role Management**: Assign user roles (USER, ADMIN, MANAGER, SUPERVISOR)
- **Toast Notifications**: Real-time feedback for all actions
- **Modal Interface**: Clean popup forms for user creation/editing

### User Dashboard (`/dashboard`)
- **Profile Display**: User information with profile picture
- **Account Status**: Verification and active status
- **Welcome Message**: Personalized greeting
- **Logout Functionality**: Secure logout with confirmation

### Login Pages
- **Admin Login**: Secure admin authentication
- **User Login**: Regular user authentication
- **Form Validation**: Client-side input validation
- **Error Handling**: User-friendly error messages
- **Auto-fill**: Demo credentials for testing

## Styling and Design

### Design System
- **Color Palette**: Professional blue and gray scheme
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle depth and elevation
- **Animations**: Smooth transitions and hover effects

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl responsive breakpoints
- **Flexible Layout**: Adapts to all screen sizes
- **Touch Friendly**: Large buttons and touch targets
