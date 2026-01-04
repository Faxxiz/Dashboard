# 🏎️ F1 Dashboard

A modern Formula 1 sports dashboard built with React + TypeScript (frontend) and NestJS + TypeScript (backend).

## 🚀 Tech Stack

### Frontend (`frontend/`)
- **React 18** + **TypeScript**
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Framer Motion** - Animation library
- **Recharts** - Chart library

### Backend (`backend/`)
- **NestJS** + **TypeScript**
- **Axios** - HTTP client for external API calls
- RESTful API architecture

## 📦 Getting Started

### Prerequisites
- **Node.js 18+** (required for Vite 5 and modern features)
- **pnpm 8+** (package manager)

To check your versions:
```bash
node --version  # Should be v18.0.0 or higher
pnpm --version  # Should be 8.0.0 or higher
```

**Upgrading Node.js in WSL:**
If you have an older version, you can use the provided script:
```bash
bash upgrade-node.sh
```

Or manually install nvm and upgrade:
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell or run:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install latest LTS Node.js
nvm install --lts
nvm use --lts
nvm alias default node
```

### Installation

Install all dependencies (frontend and backend) from the root:

```bash
pnpm install
```

This will install dependencies for both `frontend/` and `backend/` using pnpm workspaces.

### Running the Application

**Start both backend and frontend together (recommended):**
```bash
pnpm run dev
```
This will start:
- Backend on `http://localhost:3000`
- Frontend on `http://localhost:5173`

**Or start them separately:**

1. **Start the backend server:**
```bash
cd backend
pnpm run start:dev
```
Backend will run on `http://localhost:3000`

2. **Start the frontend dev server:**
```bash
cd frontend
pnpm run dev
```
Frontend will run on `http://localhost:5173`

**Or from the root using workspace commands:**
```bash
pnpm --filter backend run start:dev
pnpm --filter frontend run dev
```

## 📁 Project Structure

```
Dashboard/
├── frontend/        # React + TypeScript frontend
│   ├── src/
│   │   ├── api/     # API configuration
│   │   ├── pages/   # Page components
│   │   └── ...
│   └── ...
└── backend/         # NestJS + TypeScript backend
    ├── src/
    │   ├── domain/      # Provider-agnostic domain models
    │   ├── providers/   # External API providers (Ergast, etc.)
    │   ├── sports/      # Orchestration layer (service, controller, DTOs)
    │   └── ...
    └── ...
```

## 🔧 Development

**From root (recommended):**
- Install: `pnpm install` (installs all workspace dependencies)
- Frontend: `pnpm --filter frontend run dev`
- Backend: `pnpm --filter backend run start:dev`
- Build all: `pnpm --filter "./*" run build`

**Or from individual directories:**
- Frontend: `cd frontend && pnpm run dev`
- Backend: `cd backend && pnpm run start:dev`

## 📝 Notes

This project was migrated from Quasar (Vue.js) to React + TypeScript. The backend uses the **Jolpica F1 API** (Ergast-compatible, free and open source).

The backend architecture is **provider-agnostic**, meaning you can easily swap or add different sports API providers without changing the frontend code. See `backend/ARCHITECTURE.md` for details.
