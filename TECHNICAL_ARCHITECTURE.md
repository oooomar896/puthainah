# Bakora Amal - Technical Architecture Documentation

## Project Overview

Bakora Amal is a modern, scalable platform connecting service providers and requesters in the low voltage systems sector. This document outlines the technical architecture, key decisions, and implementation details.

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with RTL support
- **State Management**: Zustand
- **UI Components**: Headless UI, Lucide React
- **Animations**: Framer Motion, GSAP
- **Charts**: Recharts
- **Form Handling**: Formik with Yup validation
- **Notifications**: Sonner (toast notifications)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS policies
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Real-time subscriptions

### Development & Deployment
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Deployment**: Netlify
- **Environment**: Node.js 18+

## Architecture Overview

### Clean Architecture Principles

The project follows clean architecture principles with clear separation of concerns:

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities and configurations
├── services/               # Business logic and API services
├── store/                  # Zustand state management
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

### Key Architectural Decisions

#### 1. TypeScript Integration
- **Strict TypeScript**: Enabled strict mode for better type safety
- **Database Types**: Auto-generated types from Supabase schema
- **Path Aliases**: Clean import paths with `@/*` alias

#### 2. State Management with Zustand
- **Lightweight**: Replaced Redux with Zustand for simplicity
- **Persistent State**: User authentication and UI preferences
- **DevTools**: Development debugging support

#### 3. Modern Authentication
- **Supabase Auth**: JWT-based authentication
- **Role-based Access**: Admin, Provider, Requester roles
- **Row Level Security**: Database-level security policies

#### 4. API Service Layer
- **Type-safe Services**: All API calls are type-safe
- **Error Handling**: Centralized error handling with user-friendly messages
- **Caching**: Built-in caching for better performance

## Database Schema

### Core Tables

#### Profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  role TEXT CHECK (role IN ('Admin', 'Provider', 'Requester')) NOT NULL,
  entity_type_id UUID REFERENCES entity_types(id),
  city_id UUID REFERENCES cities(id),
  commercial_register TEXT,
  is_blocked BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Requests & Projects
```sql
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id),
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES request_statuses(id),
  price DECIMAL(10, 2),
  provider_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_id UUID REFERENCES project_statuses(id),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security & RLS Policies

All tables have Row Level Security (RLS) enabled with appropriate policies:

- **Profiles**: Users can only view/edit their own profile
- **Requests**: Requesters can view their requests, providers can view assigned requests
- **Projects**: Both requesters and providers can view their projects
- **Admin Access**: Admin role has full access to all records

## Key Features Implementation

### 1. Authentication System

```typescript
// Modern auth service with TypeScript
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse>
  async signup(credentials: SignupCredentials): Promise<AuthResponse>
  async getCurrentUser(): Promise<AuthResponse>
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<ProfileResponse>
}
```

### 2. State Management

```typescript
// Zustand store for authentication
interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  logout: () => void
}
```

### 3. API Services

```typescript
// Base service with error handling
export class BaseService {
  protected async handleSupabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>
  ): Promise<{ data: T | null; error: string | null }>
}

// Specialized services
export class ProfileService extends BaseService
export class RequestService extends BaseService
export class ProjectService extends BaseService
export class NotificationService extends BaseService
```

### 4. Custom Hooks

```typescript
// Authentication hook
export const useAuth = () => {
  const login = async (credentials: LoginCredentials) => void
  const signup = async (credentials: SignupCredentials) => void
  const logout = async () => void
  const checkAuth = async () => void
}

// Auth guard hook
export const useRequireAuth = (allowedRoles?: string[]) => {
  // Automatic redirect based on role
}
```

## Performance Optimizations

### 1. Code Splitting
- **Route-based splitting**: Automatic with Next.js App Router
- **Component lazy loading**: For heavy components
- **Dynamic imports**: For third-party libraries

### 2. Database Optimizations
- **Indexes**: Optimized database indexes for common queries
- **Query optimization**: Efficient joins and filters
- **Pagination**: Server-side pagination for large datasets

### 3. Caching Strategies
- **Static generation**: ISR for static content
- **Client-side caching**: Zustand store for frequently accessed data
- **Database caching**: Supabase built-in caching

### 4. Image Optimization
- **Next.js Image**: Automatic optimization and lazy loading
- **Responsive images**: Multiple sizes for different devices
- **WebP format**: Modern image format support

## Security Implementation

### 1. Authentication Security
- **JWT tokens**: Secure token-based authentication
- **Password hashing**: Bcrypt with salt rounds
- **Session management**: Secure session handling

### 2. Database Security
- **RLS policies**: Row Level Security for data access
- **Prepared statements**: SQL injection prevention
- **Data validation**: Server-side validation for all inputs

### 3. Application Security
- **Input sanitization**: XSS prevention
- **CORS policies**: Proper CORS configuration
- **HTTPS enforcement**: Secure connections only

## Deployment Configuration

### Netlify Configuration
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

## Development Guidelines

### Code Quality
- **TypeScript strict mode**: All code must be type-safe
- **ESLint rules**: Follow Next.js and React best practices
- **Component structure**: Keep components under 300 lines
- **Function complexity**: Single responsibility principle

### Git Workflow
- **Feature branches**: Use feature branches for development
- **Commit messages**: Follow conventional commit format
- **Code reviews**: All code must be reviewed before merge
- **Testing**: Write tests for critical functionality

### Performance Monitoring
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Error tracking**: Implement error boundary and logging
- **Analytics**: Track user interactions and performance

## Future Enhancements

### Planned Features
1. **Mobile Application**: React Native app for iOS/Android
2. **Real-time Notifications**: WebSocket integration
3. **Advanced Analytics**: Business intelligence dashboard
4. **AI Integration**: Smart matching and recommendations
5. **Multi-language Support**: Enhanced i18n implementation

### Technical Improvements
1. **Microservices**: Split into microservices architecture
2. **CDN Integration**: Global content delivery
3. **Advanced Caching**: Redis integration for better performance
4. **Monitoring**: Comprehensive monitoring and alerting
5. **Testing**: Comprehensive test coverage

## Support & Maintenance

### Documentation
- **API Documentation**: Auto-generated API docs
- **Component Library**: Storybook for UI components
- **Deployment Guide**: Step-by-step deployment instructions

### Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Lighthouse CI integration
- **Uptime**: Status page and monitoring

### Backup & Recovery
- **Database backups**: Automated daily backups
- **File storage**: Redundant storage with versioning
- **Disaster recovery**: Comprehensive recovery procedures

---

This architecture ensures the platform is scalable, maintainable, and ready for production use while preserving the existing UI/UX and meeting all requirements from the PRD.