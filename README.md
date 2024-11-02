# Asset Manager

A full-stack application for managing digital assets with blockchain-like transaction tracking, built with Next.js 14, Fastify, tRPC, and PostgreSQL.

## Features

- 🔐 User Authentication (Register/Login)
- 💼 Asset Management (Create, View, Transfer)
- 📜 Transaction History
- 🔍 Advanced Filtering and Search
- 🔔 Notifications

## Additional Features

### Security

- CSRF Protection
- Protected API Routes
- Session-based Authentication

### UI/UX

- Toast Notifications
- Responsive Design
- Advanced Table Features
  - Sorting
  - Filtering
  - Pagination
  - Column Visibility Toggle

### Architecture

- Monorepo Structure with Turborepo
- Server-Side Rendering (SSR)

## Tech Stack

### Build & Development

- Turborepo (Monorepo build system)
- npm (Package manager)
- TypeScript

### Frontend

- Next.js 14
- Tailwind CSS
- Shadcn/ui Components
- TanStack Query
- tRPC

### Backend

- Fastify
- tRPC
- PostgreSQL (Supabase)
- Drizzle ORM

### Shared Packages

- `@assetmanager/db`: Shared database package with Drizzle ORM schemas and migrations

## Project Structure

```
assetmanager/
├── apps/
│   ├── frontend/     # Next.js frontend application
│   └── backend/      # Fastify backend server
├── shared/        # Shared packages
│   ├── db/          # Database schema,  and utilities
├── turbo.json      # Turborepo configuration
└── package.json    # Root package.json for workspace
```

## Prerequisites

- Node.js 18+
- npm 10+

## Environment Setup

Create `.env` file in each directory:

```env
# Frontend
NEXT_PUBLIC_API_ROUTE="http://localhost:3001"

# Backend
DATABASE_URL="postgresql://user:password@localhost:5432/assetmanager"
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/khalilselyan/assetmanagerproject.git
cd assetmanagerproject
```

2. Install dependencies (using npm):

```bash
# from root folder
npm install
```

3. Set up the database:

```bash
cd shared/db
npm run db:push
```

## Development

Run the development servers:

```bash
# from root folder
npm run dev
```

This will start all applications and watch shared packages for changes using Turborepo's pipeline:

- Frontend: <http://localhost:3000>
- Backend: <http://localhost:3001>

## Build

Build all applications and packages:

```bash
npm run build
```

Turborepo will automatically handle the build order and cache the outputs for faster subsequent builds.

## Production

Start the production servers:

```bash
npm run start
```

## Database Schema

The application uses the following main tables:

- `user`: User accounts and authentication
- `asset`: Digital assets and ownership
- `transaction`: Asset transfer history
- `notification`: System notifications

## API Routes

The backend exposes the following tRPC routes:

- `auth`: User authentication and session management
- `asset`: Asset CRUD operations
- `transaction`: Transfer history
- `notification`: User notifications
