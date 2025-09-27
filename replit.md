# Kestía Boracay Restaurant System

## Overview

Kestía Boracay is a full-stack restaurant web application built with modern technologies. It provides a comprehensive digital presence for a restaurant including menu display, online reservations, event management, and administrative controls. The application features a customer-facing interface with mobile-optimized navigation and an admin dashboard for content management.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application with TypeScript for type safety
- **Vite**: Fast build tool and development server with hot module replacement
- **Wouter**: Lightweight client-side routing library
- **TanStack Query**: Data fetching and caching with optimistic updates
- **React Hook Form + Zod**: Form handling with schema validation
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built components
- **Radix UI**: Accessible component primitives for complex UI elements

### Backend Architecture
- **Express.js**: Node.js web framework handling API routes and static file serving
- **File-based Storage**: JSON files for data persistence with plans for PostgreSQL migration
- **Visitor Tracking**: IP-based analytics for understanding user engagement
- **Middleware Stack**: Request logging, JSON parsing, and error handling

### Database Layer
- **Current**: JSON file storage for menu items, reservations, events, and offers
- **Planned**: PostgreSQL with Drizzle ORM (configuration already in place)
- **Schema**: Defined TypeScript schemas with Zod validation for data consistency

## Key Components

### Menu Management System
- **Category-based Organization**: Breakfast, appetizers, soups, main dishes, sides, desserts, vegetarian
- **Price Display**: Philippine Peso (₱) currency formatting
- **Special Items**: Highlighting featured menu items
- **Mobile-Responsive**: Touch-friendly interface for mobile ordering

### Reservation System
- **Date/Time Selection**: Calendar integration with time slot management
- **Guest Management**: Party size and seating preferences
- **Form Validation**: Real-time validation with error messaging
- **Status Tracking**: Pending, confirmed, cancelled reservation states

### Admin Dashboard
- **Authentication**: Simple localStorage-based admin authentication
- **Menu Management**: CRUD operations for menu items
- **Reservation Management**: View and update reservation status
- **Offers Management**: Happy hour and promotional content management
- **Visitor Analytics**: Track unique visitors and returning customers

### Navigation System
- **Icon Navigation**: Bottom-fixed mobile navigation with 7 main sections
- **Responsive Design**: Desktop and mobile-optimized layouts
- **Color-coded Icons**: Visual hierarchy with brand colors

## Data Flow

### Client-Side Data Flow
1. **Page Load**: TanStack Query fetches initial data with caching
2. **User Interactions**: Form submissions trigger API calls with optimistic updates
3. **State Management**: React Hook Form manages form state, TanStack Query manages server state
4. **Error Handling**: Global error boundaries with user-friendly messaging

### Server-Side Data Flow
1. **Request Processing**: Express middleware logs requests and parses JSON
2. **Route Handling**: RESTful API endpoints for different resources
3. **Data Persistence**: JSON file operations with atomic writes
4. **Response Generation**: Structured JSON responses with proper HTTP status codes

### Visitor Tracking Flow
1. **Request Interception**: Middleware captures IP and user agent
2. **Visitor Identification**: Hash-based unique visitor ID generation
3. **Analytics Storage**: Visit counts and timestamps in JSON storage
4. **Stats Generation**: Real-time analytics for admin dashboard

## External Dependencies

### Google Services
- **Google Maps API**: Interactive map display for restaurant location
- **Maps JavaScript API**: Custom styling and marker placement

### UI Component Libraries
- **Radix UI**: Accessible components (dialog, popover, select, etc.)
- **Lucide Icons**: Consistent icon system throughout the application
- **React Icons**: Additional icon support (Font Awesome stars)

### Development Tools
- **ESBuild**: Fast JavaScript bundling for production builds
- **PostCSS**: CSS processing with Tailwind CSS
- **TypeScript**: Type checking and IntelliSense support

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React application to `dist/public`
- **Server Build**: ESBuild bundles Node.js server to `dist/index.js`
- **Asset Optimization**: Static asset compression and caching headers

### Environment Configuration
- **Development**: Hot module replacement with Vite dev server
- **Production**: Optimized builds with static file serving
- **Database**: Environment variable for PostgreSQL connection (DATABASE_URL)

### File Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Drizzle database migrations
└── *.json          # File-based data storage
```

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.