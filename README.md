# Gold Price Tracker - Precious Metals Price Tracking Web Application

A full-stack web application for tracking real-time and historical prices of precious metals (gold, silver, platinum, palladium) with portfolio management and price alert features.

## Features

- ✨ Real-time price tracking for gold, silver, platinum, and palladium
- 📊 Interactive price charts with historical data
- 💼 Portfolio management to track your precious metals holdings
- 🔔 Price alerts and email notifications
- 📱 Mobile-responsive design
- 🌍 Multi-currency support (USD, EUR, GBP, INR)
- 🔐 Secure user authentication with JWT
- 📈 Analytics and performance tracking

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **TypeScript:** Full type safety

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Cron Jobs:** node-cron

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## Installation

### 1. Clone or Initialize the Project

The project structure is already set up in the current directory.

### 2. Install Dependencies

**Important:** Due to npm version compatibility, please upgrade npm first:

```bash
npm install -g npm@latest
```

Then install project dependencies:

```bash
# Install all dependencies
npm install

# Or install manually if you encounter issues:
npm install next@14 react@18 react-dom@18
npm install typescript tailwindcss postcss autoprefixer --save-dev
npm install axios bcryptjs jsonwebtoken pg express cors dotenv recharts date-fns nodemailer node-cron zod
npm install @types/node @types/react @types/react-dom @types/bcryptjs @types/jsonwebtoken @types/express @types/cors @types/nodemailer @types/node-cron --save-dev
```

### 3. Set Up PostgreSQL Database

Create a PostgreSQL database:

```sql
CREATE DATABASE gold_tracker;
```

### 4. Configure Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gold_tracker
DB_USER=your_postgres_user
DB_PASSWORD=your_postgres_password

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Metals API (Get your free API key from https://metals-api.com/)
METALS_API_KEY=your-metals-api-key-here

# Email Configuration (for Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
```

### 5. Getting a Metals API Key

1. Visit [https://metals-api.com/](https://metals-api.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env` file

**Alternative:** The app includes mock data for development if no API key is provided.

## Running the Application

### Development Mode

Start the backend server:

```bash
npm run server
```

In a separate terminal, start the Next.js frontend:

```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

Build the frontend:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
Gold_Price_Tracker/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # User dashboard
│   ├── portfolio/         # Portfolio management
│   ├── alerts/            # Price alerts
│   └── profile/           # User profile
├── components/            # React components
│   ├── Navbar.tsx
│   ├── PriceCard.tsx
│   └── PriceChart.tsx
├── server/                # Backend API
│   ├── index.ts           # Express server entry
│   ├── config/
│   │   └── database.ts    # Database configuration
│   ├── routes/            # API routes
│   │   ├── auth.ts
│   │   ├── prices.ts
│   │   ├── portfolio.ts
│   │   ├── alerts.ts
│   │   └── user.ts
│   ├── middleware/
│   │   └── auth.ts        # Auth middleware
│   └── services/
│       ├── metalPriceAPI.ts
│       └── priceUpdateService.ts
├── .env                   # Environment variables
├── .env.example           # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify/:token` - Verify email

### Prices
- `GET /api/prices/current` - Get current prices for all metals
- `GET /api/prices/history/:metal` - Get historical prices
- `GET /api/prices/stats/:metal` - Get price statistics

### Portfolio (Protected)
- `GET /api/portfolio` - Get all portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/:id` - Get portfolio details
- `POST /api/portfolio/:id/holdings` - Add holding to portfolio
- `DELETE /api/portfolio/:portfolioId/holdings/:holdingId` - Delete holding
- `DELETE /api/portfolio/:id` - Delete portfolio

### Alerts (Protected)
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/history` - Get alert history

### User (Protected)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Database Schema

The application automatically creates the following tables on first run:

- `users` - User accounts
- `metal_prices` - Historical price data
- `portfolios` - User portfolios
- `portfolio_holdings` - Portfolio holdings
- `price_alerts` - Price alerts
- `alert_history` - Alert trigger history

## Features in Detail

### 1. Real-Time Price Tracking
- Prices update every 5 minutes automatically
- Supports Gold, Silver, Platinum, and Palladium
- Multi-currency display (USD, EUR, GBP, INR)
- Shows 24-hour price changes and percentages

### 2. Portfolio Management
- Create multiple portfolios
- Track quantity, purchase price, and purchase date
- Real-time profit/loss calculations
- Export portfolio data to CSV/PDF

### 3. Price Alerts
- Set alerts for target prices (above/below)
- Email notifications when alerts trigger
- Alert history tracking

### 4. Interactive Charts
- Historical price data visualization
- Customizable date ranges (7D, 30D, 90D, 1Y)
- Line charts with Recharts library

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- SQL injection prevention
- Input validation with Zod

## Troubleshooting

### Database Connection Error
Ensure PostgreSQL is running and credentials in `.env` are correct.

### API Price Fetch Error
Check your Metals API key is valid. The app will use mock data in development mode if the API fails.

### Port Already in Use
Change the ports in `.env`:
```env
API_PORT=5001  # Change backend port
```

And update `next.config.js` for frontend.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@goldtracker.com

## Acknowledgments

- Price data provided by [Metals API](https://metals-api.com/)
- Built with Next.js and Express.js
- UI components styled with Tailwind CSS

---

**Happy Tracking! 📈💰**
