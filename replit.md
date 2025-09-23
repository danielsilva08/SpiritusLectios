# Overview

Spiritus Lectoris is a full-stack web application for managing a personal book library. Built with React frontend and Express.js backend, it provides authentication, book management (CRUD operations), search functionality, analytics dashboard, and data export capabilities. The application uses a clean, modern UI built with Tailwind CSS and shadcn/ui components, supporting both light and dark themes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom aliases and Replit integration plugins

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Session Management**: Express sessions with configurable storage
- **Validation**: Zod schemas for request/response validation
- **Storage Abstraction**: Interface-based storage layer with in-memory implementation
- **Development**: Hot module replacement via Vite middleware in development

## Authentication System
- **Method**: Session-based authentication with hardcoded password
- **Session Storage**: Configurable via express-session (defaults to memory store)
- **Protection**: Route-level authentication middleware
- **Flow**: Login → Session creation → Route protection via middleware

## Data Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Shared schema definitions between client and server
- **Migration**: Drizzle Kit for database schema management
- **Storage Interface**: Abstracted storage layer allowing multiple implementations
- **Current Implementation**: In-memory storage for development/testing

## API Architecture
- **Pattern**: RESTful API design
- **Endpoints**: 
  - Authentication (`/api/auth/*`)
  - Books CRUD (`/api/books/*`)
  - Statistics (`/api/books/stats`)
- **Error Handling**: Centralized error middleware with consistent JSON responses
- **Logging**: Request/response logging for API endpoints

## Development Environment
- **Hot Reloading**: Vite dev server integration with Express
- **Path Aliases**: TypeScript path mapping for clean imports
- **Replit Integration**: Custom plugins for development banner and error overlay
- **Build Process**: Separate client (Vite) and server (esbuild) build processes

# External Dependencies

## Database
- **Primary**: PostgreSQL via Neon Database serverless driver
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Environment variable-based database URL configuration

## UI Components
- **Component Library**: Radix UI primitives for accessibility
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Form Handling**: Hookform with Radix UI integration

## Development Tools
- **Build**: Vite for frontend, esbuild for backend
- **Type Checking**: TypeScript with strict configuration
- **Session Storage**: connect-pg-simple for PostgreSQL session storage (configured but not actively used)

## Hosting Platform
- **Platform**: Configured for Replit deployment
- **Plugins**: Replit-specific Vite plugins for development experience
- **Environment**: Node.js with ES modules support