# PortfolioCraft

## Overview

PortfolioCraft is a full-stack web application that enables users to create, customize, and share professional portfolios online. The platform provides template-based portfolio creation with drag-and-drop functionality, project management, and public portfolio sharing capabilities. Built as a modern monorepo with React frontend and Express backend, it offers a comprehensive solution for professionals to showcase their work and track engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
The application follows a monorepo pattern with three main directories:
- `client/` - React frontend with TypeScript and Vite
- `server/` - Express.js backend with TypeScript
- `shared/` - Common schemas and types shared between frontend and backend

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit-specific OpenID Connect (OIDC) authentication system
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **File Uploads**: Multer middleware for handling portfolio assets and project files

### Database Design
The PostgreSQL schema includes:
- **Users**: Core user information required for Replit Auth integration
- **Portfolios**: User-created portfolios with customization settings and templates
- **Projects**: Individual portfolio items with media and metadata
- **Templates**: Pre-built portfolio designs for quick setup
- **Sessions**: Required session storage for authentication persistence

### Authentication System
- **Provider**: Replit OpenID Connect for seamless platform integration
- **Session Storage**: PostgreSQL-backed sessions with automatic cleanup
- **Authorization**: Route-level authentication middleware protecting user-specific resources
- **User Management**: Automatic user creation and profile updates from OIDC claims

### API Architecture
RESTful API design with the following endpoints:
- **Authentication**: `/api/auth/*` - User login, logout, and profile management
- **Portfolios**: `/api/portfolios/*` - CRUD operations for user portfolios
- **Projects**: `/api/projects/*` - Project management within portfolios
- **Templates**: `/api/templates/*` - Portfolio template browsing and selection
- **Public**: `/api/public/*` - Public portfolio viewing without authentication

### Development Features
- **Hot Reload**: Vite dev server with HMR for rapid frontend development
- **Error Handling**: Centralized error middleware with structured responses
- **Request Logging**: Detailed API request logging for debugging
- **Type Safety**: End-to-end TypeScript with shared schemas via Drizzle Zod

### Build and Deployment
- **Frontend Build**: Vite builds to `dist/public` for static serving
- **Backend Build**: ESBuild bundles server code to `dist/index.js`
- **Database Migrations**: Drizzle Kit handles schema migrations and deployments
- **Production Serving**: Express serves both API endpoints and static frontend assets

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with migration management

### Authentication Services
- **Replit OIDC**: Platform-native authentication for seamless user experience
- **OpenID Client**: Standard OIDC implementation with Passport.js integration

### UI and Design Systems
- **Radix UI**: Headless component primitives for accessibility compliance
- **Tailwind CSS**: Utility-first CSS framework with design system tokens
- **Lucide Icons**: Comprehensive icon library for consistent visual design

### Development Tools
- **Vite**: Next-generation build tool with plugin ecosystem
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Static type checking across the entire application stack

### File Storage
- **Local Storage**: Multer-based file uploads to local filesystem (configurable for cloud storage)