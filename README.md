# SnoreMD Web UI

React-based web interface for the SnoreMD Medical Notes API.

## Documentation

See the [docs/](./docs/) folder for screenshots and additional documentation:

- `dashboard.png` - Dashboard view
- `patient-list.png` - Patient list view
- `note-list.png` - Notes list view
- `note-view.png` - Note detail view
- `non-admin-delete-attempt.png` - Non-admin delete attempt error

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router 6** for routing
- **Tailwind CSS** for styling
- **Context API** for state management

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/          # Button, Input, Card, Alert, Loading
│   ├── layout/          # Header, Sidebar, Layout
│   ├── auth/            # LoginForm, ProtectedRoute
│   └── notes/           # NoteCard, NotesList, NoteForm, NoteDetail
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   └── NotesContext.tsx # Notes CRUD state
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── PatientsPage.tsx
│   ├── PatientNotesPage.tsx
│   └── NoteDetailPage.tsx
├── services/            # API services
│   ├── api.ts           # Base API client
│   ├── auth.service.ts  # Authentication service
│   ├── notes.service.ts # Notes CRUD service
│   └── config.ts        # API configuration
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main application component
├── main.tsx             # Entry point
└── index.css            # Global styles (Tailwind)
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Development

```bash
# Start development server
npm run dev
```

The app runs at `http://localhost:3001` with API requests proxied to the backend.

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

### State Management

The app uses React Context API for state management:

1. **AuthContext** - Manages authentication state
   - User login/logout
   - Token storage in localStorage
   - JWT token parsing for user info
   - Protected route handling

2. **NotesContext** - Manages notes CRUD state
   - Notes list with pagination
   - Create, update, delete notes
   - File attachment upload
   - Loading and error states

### API Integration

The `services/` directory contains the API integration layer:

- **api.ts** - Base HTTP client with auth token injection
- **auth.service.ts** - Login, logout, token management
- **notes.service.ts** - Notes CRUD operations, presigned URL handling

### Component Architecture

Components are organized by domain:

- **common/** - Reusable UI primitives (Button, Input, Card, etc.)
- **layout/** - App shell components (Header, Sidebar, Layout)
- **auth/** - Authentication components (LoginForm, ProtectedRoute)
- **notes/** - Notes-specific components (NoteCard, NotesList, etc.)

## Authentication

The app authenticates against the SnoreMD API using Cognito JWT tokens.

### Token Storage

Tokens are stored in localStorage:
- `snoremd_id_token` - JWT ID token (used for API auth)
- `snoremd_access_token` - Cognito access token
- `snoremd_refresh_token` - Refresh token
- `snoremd_token_expiry` - Token expiration timestamp
- `snoremd_user` - Parsed user info

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | API base URL | `/api` (uses Vite proxy) |
| `VITE_API_TARGET` | Proxy target URL for dev server | AWS API Gateway dev endpoint |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test --coverage` | Run test with full detail |
## CI/CD

This project uses GitHub Actions for continuous integration.

**Disclaimer:** The current CI/CD pipeline is for **testing purposes only**. There is **no automatic deployment** configured. Deployments must be done manually.

### GitHub Actions Workflow

The workflow (`.github/workflows/test-on-dev.yml`) runs on push and pull requests to the `dev` branch:

| Step | Command | Description |
|------|---------|-------------|
| Linting | `npm run lint` | Checks code style and potential errors |
| Type Check | `npm run typecheck` | Validates TypeScript types |
| Unit Tests | `npm test` | Runs the test suite |
| Build | `npm run build` | Verifies the app builds successfully |

## Features

### Authentication
- Login with username/password
- Automatic token refresh handling
- Protected routes with redirect

### Dashboard
- Welcome message with user info
- Quick actions navigation
- System information display

### Patients
- Patient list with search
- Custom patient ID input
- Click to view patient notes

### Notes
- Create new notes with form
- List notes with pagination
- View note details
- Edit existing notes
- Delete notes (soft delete)
- Upload file attachments

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User authentication |
| GET | `/patients/{patientId}/notes` | List patient notes |
| POST | `/patients/{patientId}/notes` | Create note |
| GET | `/patients/{patientId}/notes/{noteId}` | Get note |
| PUT | `/patients/{patientId}/notes/{noteId}` | Update note |
| DELETE | `/patients/{patientId}/notes/{noteId}` | Delete note |
| POST | `/patients/{patientId}/notes/{noteId}/attachments/presign` | Get upload URL |
