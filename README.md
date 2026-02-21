# 🎨 Artful Insights — Frontend

React + TypeScript frontend for the AI Art Evaluation System.

## Tech Stack

- **React 18** + TypeScript
- **Vite** — Fast build tool
- **Tailwind CSS** + shadcn/ui — Styling & UI components
- **React Query** (TanStack) — Server state management
- **Axios** — HTTP client with JWT interceptor
- **Framer Motion** — Animations
- **Recharts** — Data visualization
- **React Router v6** — Client-side routing

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (port 8080)
npm run dev
```

The frontend connects to the Django backend at `http://localhost:8000` by default.

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── evaluations/  # Score circle, charts, feedback cards
│   ├── layout/       # AppLayout, Navbar, ProtectedRoute
│   └── ui/           # shadcn/ui primitives
├── contexts/         # AuthContext (JWT auth state)
├── hooks/            # Custom React hooks
├── lib/              # API client (axios + interceptors)
├── pages/            # Route pages
│   ├── Dashboard     # Stats overview + recent evaluations
│   ├── Upload        # Drag & drop artwork upload
│   ├── EvaluationResults # Detailed scoring with charts
│   ├── History       # Past evaluations list
│   ├── Profile       # User profile management
│   ├── Login / Register
│   └── NotFound
└── types/            # TypeScript interfaces
```

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run tests
npm run lint       # ESLint check
```
