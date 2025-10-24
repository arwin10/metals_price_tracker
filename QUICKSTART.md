# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- npm 7+ (will be upgraded automatically by setup script)

## Option 1: Automated Setup (Recommended for Windows)

Run the PowerShell setup script:

```powershell
.\setup.ps1
```

This will:
- Check your Node.js and npm versions
- Upgrade npm if needed
- Install all dependencies step-by-step
- Create a `.env` file from the example

## Option 2: Manual Setup

### 1. Install Dependencies

```bash
# Upgrade npm first (if needed)
npm install -g npm@latest

# Install all dependencies
npm install
```

If you encounter errors, try installing dependencies in stages:

```bash
# Core packages
npm install next@14 react@18 react-dom@18

# Development tools
npm install --save-dev typescript @types/react @types/node @types/react-dom tailwindcss postcss autoprefixer eslint eslint-config-next

# Backend packages
npm install express cors dotenv pg bcryptjs jsonwebtoken zod axios recharts date-fns nodemailer node-cron

# Backend type definitions
npm install --save-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/node-cron
```

### 2. Configure Environment

```bash
# Copy example environment file
copy .env.example .env

# Edit .env and update:
# - Database credentials
# - JWT secret (use a strong random string)
# - Metals API key (get free key from https://metals-api.com/)
# - Email settings (if using alerts)
```

### 3. Set Up Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE gold_tracker;

# Exit psql
\q

# Or run the initialization script
psql -U postgres -d gold_tracker -f database/init.sql
```

**Note:** The application will automatically create tables on first run.

### 4. Start the Application

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## Option 3: Docker Setup

If you have Docker installed:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Troubleshooting

### npm install fails

**Old npm version:**
```bash
npm install -g npm@latest
npm cache clean --force
npm install
```

**Dependency conflicts:**
```bash
npm install --legacy-peer-deps
```

### Database connection error

1. Ensure PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Start if not running
   Start-Service postgresql-x64-15
   ```

2. Check credentials in `.env` match your PostgreSQL setup

3. Test connection:
   ```bash
   psql -U your_username -d gold_tracker
   ```

### Port already in use

Change ports in `.env`:
```env
API_PORT=5001  # Change backend port
```

For frontend, update `next.config.js` or run:
```bash
npm run dev -- -p 3001
```

### API key issues

- Get a free API key from [metals-api.com](https://metals-api.com/)
- The app uses mock data in development if no API key is provided
- Add your API key to `.env`:
  ```env
  METALS_API_KEY=your_api_key_here
  ```

## Default Test Credentials

After registering your first user, you can use those credentials to log in. The app doesn't include default users for security reasons.

## Next Steps

1. **Register an account** at http://localhost:3000/register
2. **Explore the dashboard** to see current prices
3. **Create a portfolio** to track your investments
4. **Set up price alerts** to get notified
5. **View historical charts** for price trends

## Development Commands

```bash
# Start development server
npm run dev

# Start backend API
npm run server

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
Gold_Price_Tracker/
├── app/              # Next.js pages
├── components/       # React components
├── server/           # Backend API
├── database/         # SQL scripts
├── .env              # Environment variables
└── README.md         # Full documentation
```

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review error logs in the terminal
- Check the [issues page](https://github.com/yourusername/gold-price-tracker/issues)

## Security Notes

🔒 **Before deploying to production:**

1. Change all default secrets in `.env`
2. Use strong passwords
3. Enable HTTPS
4. Set up proper firewall rules
5. Regular security updates

---

**Happy tracking! 📈💰**
