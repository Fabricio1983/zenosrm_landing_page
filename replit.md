# Zeno SRM

## Overview

Zeno SRM is a supplier relationship management tool that helps businesses organize purchases and save money through intelligent quote equalization. The core feature is an AI-powered quote comparison system that extracts data from supplier documents (PDFs, images, Excel files) using Google's Gemini AI, then equalizes prices across vendors to identify optimal purchasing combinations.

The application serves as both a landing page to attract leads and a functional demo tool. Users can upload up to 3 supplier quotes, have them automatically processed and compared, and see potential savings—with a lead capture modal requiring business information to view full results.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter with hash-based navigation for SPA behavior
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 with custom theme variables following Zeno brand guidelines (primary blue #2196F3, accent orange #FF5722)
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Typography**: Montserrat font family with Open Sans fallback

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx for development, esbuild for production
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **File Handling**: Multer for multipart form uploads (10MB limit per file)

### AI Integration
- **Provider**: Google Generative AI (Gemini 2.0 Flash model)
- **Purpose**: Extract structured quote data (supplier name, items, quantities, unit prices) from uploaded documents
- **Input Formats**: PDF, Excel (.xlsx), CSV, images (JPG, PNG)

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Tables**:
  - `leads`: Captures business contact info (email, company, phone)
  - `equalizations`: Stores processed quote comparisons with suppliers, items, and savings
  - `app_config`: Configurable limits for daily usage, session limits, trial periods

### Usage Limiting System
- Client-side rate limiting stored in localStorage
- Configurable daily limit (default 5 equalizations/day)
- Trial period tracking from first visit
- Phone number unlock mechanism for blocked users

### Build System
- **Development**: Vite dev server with HMR on port 5000
- **Production**: Two-step build - Vite for client bundle, esbuild for server bundle
- **Output**: `dist/public/` for static assets, `dist/index.cjs` for server

## External Dependencies

### Required Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `GEMINI_API`: Google Generative AI API key (required for quote processing)

### Third-Party Services
- **Google Generative AI**: Document processing and data extraction via Gemini API
- **PostgreSQL**: Primary data store for leads and equalizations

### Key NPM Packages
- `@google/generative-ai`: Gemini AI SDK for document analysis
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `express` + `multer`: HTTP server and file upload handling
- `react-dropzone`: File upload UI component
- `@tanstack/react-query`: Async state management
- `zod` + `drizzle-zod`: Schema validation