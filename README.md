# SnapTrade - AI-Powered Trading Analysis Platform

A cutting-edge web application that transforms trading chart analysis through intelligent AI-powered insights and engaging user experience.

## Features

### 🤖 AI-Powered Analysis
- Advanced chart pattern recognition using OpenAI GPT-4o
- Real-time market sentiment analysis from financial news
- Intelligent trading recommendations with entry/exit points
- Stop loss and take profit suggestions

### 📊 Trading Signals Marketplace
- Signal providers can share trading insights
- Subscription-based signal access
- Provider ratings and feedback system
- Earnings tracking for signal providers

### 👥 User Management
- Tiered subscription system (Standard £59/month, Premium £79/month)
- Referral program with bonus tracking
- User profiles and provider verification
- Comprehensive admin control panel

### 📈 Market Tools
- Interactive chart analysis
- Market alerts and notifications
- Asset list management
- Real-time market data integration

### 💰 Payment System
- Stripe integration for subscriptions
- Secure payment processing
- Multiple subscription tiers
- Automatic billing management

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI GPT-4o for image analysis
- **Payment**: Stripe for subscription management
- **Authentication**: Passport.js with session management

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- News API key
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snaptrade.git
cd snaptrade
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and database URL
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env` file with the following variables:

```
NODE_ENV=development
PORT=3000
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_session_secret
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_news_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed VPS deployment instructions.

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Chart Analysis
- `POST /api/analyze-chart` - Upload and analyze trading chart
- `GET /api/analysis-history` - Get user's analysis history

### Trading Signals
- `GET /api/trading-signals/free` - Get free trading signals
- `GET /api/trading-signals/premium` - Get premium trading signals
- `POST /api/trading-signals` - Create new trading signal

### Admin Panel
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/:id` - Get user details (admin only)
- `PATCH /api/admin/users/:id/admin-status` - Update admin status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@yourdomain.com or join our community Discord.

---

Built with ❤️ for the trading community