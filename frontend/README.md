# F1 Dashboard - Frontend

React + TypeScript frontend for the F1 Sports Dashboard project.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animation library
- **Recharts** - Chart library for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`

Make sure the backend server is running on `http://localhost:3000` for API calls to work.

### Build

Build for production:

```bash
pnpm run build
```

Preview production build:

```bash
pnpm run preview
```

### Scripts

- `pnpm run dev` - Start development server
- `pnpm run build` - Build for production
- `pnpm run preview` - Preview production build
- `pnpm run lint` - Run ESLint
- `pnpm run format` - Format code with Prettier

## Project Structure

```
src/
  ├── api/          # API configuration (axios)
  ├── pages/        # Page components
  ├── App.tsx       # Main app component
  ├── main.tsx      # Entry point
  └── index.css     # Global styles (Tailwind)
```

## Backend Integration

The frontend communicates with the NestJS backend running on port 3000. The Vite proxy is configured to forward `/api` requests to the backend.
