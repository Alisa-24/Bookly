# Bookly

A modern book management system with a beautiful storefront and admin panel with integrated Stripe payments.

## Features

- **User Authentication**: Google OAuth and email/password authentication
- **Book Management**: Browse, search, and filter books
- **Shopping Cart**: Add books to cart, manage quantities
- **Stripe Payments**: Secure checkout with Stripe integration
- **Order History**: Track all purchases and order status
- **Admin Panel**: Manage books, upload images, view orders
- **Responsive Design**: Works on desktop and mobile devices

## Default Admin Credentials

When you first start the application, a default admin account is automatically created:

- **Email:** `admin@bookly.com`
- **Password:** `password123`
- **Role:** `admin`

## Quick Start

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
# or using uv
uv sync

# Create .env file with your configuration
cp .env.example .env
# Edit .env and add your Stripe keys

# Run migrations if needed
python -m alembic upgrade head

# Start the server
python -m uvicorn app.main:app --reload
```

Backend runs on: `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local and add your Stripe publishable key

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Payment Integration

Bookly uses **Stripe** for secure payment processing.

### Setup Stripe

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Add keys to backend `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Add key to frontend `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### Payment Flow

1. Add books to cart
2. Click "Proceed to Checkout"
3. Complete payment on Stripe Checkout
4. View orders in dashboard

**For detailed setup instructions, see [PAYMENT_SETUP_GUIDE.md](./PAYMENT_SETUP_GUIDE.md)**

For Stripe integration documentation, see [STRIPE_INTEGRATION.md](./STRIPE_INTEGRATION.md)

## Technology Stack

### Backend

- **Framework**: FastAPI
- **Database**: SQLite (AsyncIO)
- **Auth**: FastAPI-Users with JWT
- **Payment**: Stripe
- **ORM**: SQLAlchemy

### Frontend

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Payment UI**: Stripe.js

## Project Structure

```
Bookly/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API routes
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── core/              # Config, security, Stripe
│   │   └── db/                # Database session
│   ├── .env.example           # Environment template
│   └── pyproject.toml         # Python dependencies
│
├── frontend/                   # Next.js frontend
│   ├── app/                   # Page routes
│   ├── components/            # React components
│   ├── lib/                   # Utilities and API clients
│   ├── .env.example           # Environment template
│   └── package.json           # Node dependencies
│
├── PAYMENT_SETUP_GUIDE.md     # Payment setup instructions
├── STRIPE_INTEGRATION.md      # Stripe API documentation
└── README.md                  # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/jwt/login` - Login with email
- `POST /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout

### Books

- `GET /api/books` - List all books
- `GET /api/books/{id}` - Get book details
- `POST /api/books` - Create book (admin)
- `PUT /api/books/{id}` - Update book (admin)
- `DELETE /api/books/{id}` - Delete book (admin)

### Cart

- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/{id}` - Update item quantity
- `DELETE /api/cart/items/{id}` - Remove item from cart

### Payments

- `POST /api/payments/checkout/session` - Create Stripe checkout session
- `POST /api/payments/payment-intent` - Create payment intent
- `GET /api/payments/orders` - Get user's orders
- `GET /api/payments/orders/{id}` - Get order details
- `POST /api/payments/webhook` - Stripe webhook


## License

This project is for educational purposes only. 