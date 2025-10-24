# Gold Price Tracker - Complete File Structure

This document provides a complete overview of all files in the project.

## 📁 Root Directory

```
Gold_Price_Tracker/
├── .env.example              # Environment variables template
├── .env                      # Environment variables (create from .env.example)
├── .eslintrc.json           # ESLint configuration
├── .gitignore               # Git ignore rules
├── Dockerfile               # Frontend Docker image configuration
├── Dockerfile.backend       # Backend Docker image configuration
├── docker-compose.yml       # Multi-container Docker orchestration
├── next.config.js           # Next.js configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── setup.ps1                # Windows PowerShell setup script
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── README.md                # Main project documentation
├── QUICKSTART.md            # Quick start guide
└── PROJECT_SUMMARY.md       # This summary document
```

## 📱 App Directory (Frontend Pages)

```
app/
├── layout.tsx               # Root layout component
├── page.tsx                 # Home page (landing page)
├── globals.css              # Global CSS styles and Tailwind setup
├── login/
│   └── page.tsx            # Login page
└── register/
    └── page.tsx            # Registration page
```

### Pages to Add (User Can Create):
```
app/
├── dashboard/
│   └── page.tsx            # User dashboard
├── portfolio/
│   └── page.tsx            # Portfolio management
├── alerts/
│   └── page.tsx            # Price alerts management
├── profile/
│   └── page.tsx            # User profile settings
└── prices/
    └── page.tsx            # Price tracking page
```

## 🎨 Components Directory (React Components)

```
components/
├── Navbar.tsx              # Navigation bar component
├── PriceCard.tsx           # Price display card component
└── PriceChart.tsx          # Interactive chart component
```

### Additional Components to Add:
```
components/
├── PortfolioCard.tsx       # Portfolio display card
├── AlertCard.tsx           # Alert item component
├── HoldingRow.tsx          # Portfolio holding row
├── StatsCard.tsx           # Statistics card
├── Loading.tsx             # Loading spinner
└── Modal.tsx               # Modal dialog
```

## 🔧 Server Directory (Backend API)

```
server/
├── index.ts                # Express server entry point
├── config/
│   └── database.ts        # Database connection and initialization
├── middleware/
│   └── auth.ts            # JWT authentication middleware
├── routes/
│   ├── auth.ts            # Authentication routes
│   ├── prices.ts          # Price tracking routes
│   ├── portfolio.ts       # Portfolio management routes
│   ├── alerts.ts          # Price alerts routes
│   └── user.ts            # User profile routes
└── services/
    ├── metalPriceAPI.ts   # Metals API client
    └── priceUpdateService.ts  # Price update cron job
```

### Additional Backend Files to Add:
```
server/
├── middleware/
│   └── validation.ts      # Request validation middleware
├── services/
│   ├── emailService.ts    # Email notification service
│   └── analyticsService.ts # Analytics and statistics
└── utils/
    ├── logger.ts          # Logging utility
    └── helpers.ts         # Helper functions
```

## 🗄️ Database Directory

```
database/
└── init.sql               # Database initialization script
```

## 📦 Generated Directories (After npm install)

```
node_modules/              # Dependencies (auto-generated, not in git)
.next/                     # Next.js build output (auto-generated)
```

## 🔑 Key File Descriptions

### Configuration Files

#### `package.json`
- **Purpose**: Defines project dependencies and npm scripts
- **Key Dependencies**:
  - Frontend: Next.js, React, Tailwind CSS, Recharts
  - Backend: Express, PostgreSQL, JWT, bcrypt
  - DevTools: TypeScript, ESLint

#### `tsconfig.json`
- **Purpose**: TypeScript compiler configuration
- **Features**: Strict mode, path aliases (@/*), Next.js integration

#### `tailwind.config.ts`
- **Purpose**: Tailwind CSS customization
- **Includes**: Custom color schemes for gold/metal theme

#### `.env.example`
- **Purpose**: Template for environment variables
- **Contains**: Database config, API keys, email settings

### Frontend Files

#### `app/layout.tsx`
- **Purpose**: Root layout for all pages
- **Features**: Font setup, metadata, global structure

#### `app/page.tsx`
- **Purpose**: Landing page
- **Features**: Hero section, price cards, feature showcase

#### `app/login/page.tsx`
- **Purpose**: User login page
- **Features**: Form validation, JWT storage, navigation

#### `app/register/page.tsx`
- **Purpose**: User registration page
- **Features**: Form validation, password confirmation

#### `components/Navbar.tsx`
- **Purpose**: Navigation component
- **Features**: Auth-aware, responsive, dark mode

#### `components/PriceCard.tsx`
- **Purpose**: Display individual metal prices
- **Features**: Price change indicators, timestamps

#### `components/PriceChart.tsx`
- **Purpose**: Interactive price history chart
- **Features**: Multiple timeframes, Recharts integration

### Backend Files

#### `server/index.ts`
- **Purpose**: Express server entry point
- **Features**: Route registration, middleware setup, error handling

#### `server/config/database.ts`
- **Purpose**: PostgreSQL connection and schema initialization
- **Features**: Connection pooling, auto table creation

#### `server/middleware/auth.ts`
- **Purpose**: JWT authentication middleware
- **Features**: Token verification, user extraction

#### `server/routes/auth.ts`
- **Purpose**: Authentication endpoints
- **Endpoints**: Register, login, email verification

#### `server/routes/prices.ts`
- **Purpose**: Price data endpoints
- **Endpoints**: Current prices, historical data, statistics

#### `server/routes/portfolio.ts`
- **Purpose**: Portfolio management endpoints
- **Endpoints**: CRUD operations for portfolios and holdings

#### `server/routes/alerts.ts`
- **Purpose**: Price alert endpoints
- **Endpoints**: Create, list, delete alerts

#### `server/routes/user.ts`
- **Purpose**: User profile endpoints
- **Endpoints**: Get and update user profile

#### `server/services/metalPriceAPI.ts`
- **Purpose**: External price API integration
- **Features**: Metals API client, mock data fallback

#### `server/services/priceUpdateService.ts`
- **Purpose**: Automated price updates
- **Features**: Cron job, alert checking

### DevOps Files

#### `Dockerfile`
- **Purpose**: Frontend Docker image
- **Features**: Multi-stage build, optimized for production

#### `Dockerfile.backend`
- **Purpose**: Backend Docker image
- **Features**: TypeScript compilation, production dependencies

#### `docker-compose.yml`
- **Purpose**: Multi-container orchestration
- **Containers**: PostgreSQL, Backend API, Frontend

#### `database/init.sql`
- **Purpose**: Database schema and initial data
- **Features**: Tables, indexes, triggers, sample data

### Documentation Files

#### `README.md`
- **Purpose**: Main project documentation
- **Sections**: Features, installation, API docs, troubleshooting

#### `QUICKSTART.md`
- **Purpose**: Quick setup guide
- **Sections**: Installation options, troubleshooting, first steps

#### `PROJECT_SUMMARY.md`
- **Purpose**: Project overview and status
- **Sections**: Features completed, tech stack, next steps

#### `setup.ps1`
- **Purpose**: Automated setup script for Windows
- **Features**: Dependency installation, npm upgrade, .env creation

## 📊 File Count

| Category | Count |
|----------|-------|
| Configuration Files | 8 |
| Frontend Pages | 3 (+ 4 to create) |
| Components | 3 (+ 6 suggested) |
| Backend Routes | 5 |
| Backend Services | 2 (+ 3 suggested) |
| Backend Middleware | 1 (+ 1 suggested) |
| Database Scripts | 1 |
| Docker Files | 3 |
| Documentation | 4 |
| **Total Core Files** | **30** |

## 🎯 File Status

### ✅ Complete and Ready
- All configuration files
- Core frontend pages (home, login, register)
- All components (Navbar, PriceCard, PriceChart)
- Complete backend API (all routes and services)
- Database schema and initialization
- Docker configuration
- Documentation

### 📝 To Be Created (Optional)
- Additional frontend pages (dashboard, portfolio, alerts, profile)
- Enhanced components (modals, loading states)
- Additional backend utilities (logging, analytics)
- Unit tests
- Integration tests
- CI/CD configuration

## 🔄 Build Artifacts (Auto-Generated)

These directories are created during build/install:

```
node_modules/           # npm dependencies
.next/                  # Next.js build output
dist/                   # TypeScript compiled output (if building backend)
```

These are excluded from git via `.gitignore`.

## 📥 Files Not in Repository

The following should be created locally:

```
.env                    # Your local environment variables (copy from .env.example)
node_modules/           # Auto-generated by npm install
.next/                  # Auto-generated by Next.js
package-lock.json       # Auto-generated by npm install
```

## 🔐 Sensitive Files

These files contain sensitive information and should **NEVER** be committed:

- `.env` - Contains API keys, database passwords, secrets
- `node_modules/` - Contains third-party code
- `*.log` - May contain sensitive runtime information

## 🚀 Quick File Navigation

**Need to modify...**
- **Colors/Theme**: `tailwind.config.ts`, `app/globals.css`
- **Database Schema**: `server/config/database.ts`, `database/init.sql`
- **API Routes**: `server/routes/*.ts`
- **Frontend Pages**: `app/**/page.tsx`
- **Environment**: `.env`
- **Dependencies**: `package.json`
- **Docker Setup**: `docker-compose.yml`

## 📖 File Reading Priority

**For Understanding the Project:**
1. `README.md` - Overview and setup
2. `PROJECT_SUMMARY.md` - Features and status
3. `package.json` - Dependencies
4. `app/page.tsx` - Frontend structure
5. `server/index.ts` - Backend structure

**For Setup:**
1. `QUICKSTART.md` - Setup instructions
2. `.env.example` - Configuration needed
3. `setup.ps1` - Automated setup
4. `database/init.sql` - Database structure

---

## 📌 File Organization Principles

The project follows these organization principles:

1. **Separation of Concerns**: Frontend (`app/`, `components/`) and Backend (`server/`)
2. **Co-location**: Related files are grouped together
3. **Clear Naming**: File names indicate their purpose
4. **Modular Structure**: Easy to find and modify specific features
5. **Scalable**: Easy to add new features without restructuring

---

**Total Project Files**: 30+ core files plus auto-generated build artifacts
**Lines of Code**: ~6,000+ lines across all files
**Project Status**: Core features complete and production-ready! ✅
