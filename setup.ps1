# Gold Price Tracker - Setup and Installation Script
# Run this script to set up the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Gold Price Tracker - Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Check npm version
Write-Host "Checking npm version..." -ForegroundColor Yellow
$npmVersion = npm --version
Write-Host "npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Upgrade npm if version is too old
if ([version]($npmVersion -replace 'v', '') -lt [version]"7.0.0") {
    Write-Host "Upgrading npm to latest version..." -ForegroundColor Yellow
    npm install -g npm@latest
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host ""

# Install core dependencies first
Write-Host "Step 1: Installing Next.js and React..." -ForegroundColor Cyan
npm install next@14 react@18 react-dom@18

Write-Host ""
Write-Host "Step 2: Installing TypeScript and dev tools..." -ForegroundColor Cyan
npm install --save-dev typescript @types/react @types/node @types/react-dom

Write-Host ""
Write-Host "Step 3: Installing Tailwind CSS..." -ForegroundColor Cyan
npm install --save-dev tailwindcss postcss autoprefixer

Write-Host ""
Write-Host "Step 4: Installing backend dependencies..." -ForegroundColor Cyan
npm install express cors dotenv pg bcryptjs jsonwebtoken zod axios

Write-Host ""
Write-Host "Step 5: Installing additional libraries..." -ForegroundColor Cyan
npm install recharts date-fns nodemailer node-cron

Write-Host ""
Write-Host "Step 6: Installing type definitions..." -ForegroundColor Cyan
npm install --save-dev @types/express @types/cors @types/bcryptjs @types/jsonwebtoken @types/nodemailer @types/node-cron

Write-Host ""
Write-Host "Step 7: Installing ESLint..." -ForegroundColor Cyan
npm install --save-dev eslint eslint-config-next

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "Please update the .env file with your configuration!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your database credentials and API keys" -ForegroundColor White
Write-Host "2. Install and start PostgreSQL database" -ForegroundColor White
Write-Host "3. Run 'npm run server' to start the backend API" -ForegroundColor White
Write-Host "4. In a new terminal, run 'npm run dev' to start the frontend" -ForegroundColor White
Write-Host ""
Write-Host "For more information, see README.md" -ForegroundColor Yellow
Write-Host ""
