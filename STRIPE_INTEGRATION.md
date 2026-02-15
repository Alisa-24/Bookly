# Stripe Integration Technical Overview

This document describes how Stripe is architecturally integrated into the Bookly full-stack application.

## Architecture Overview

Bookly treats Stripe as the source of truth for payment status. The integration is designed to be resilient, handling both direct redirects and asynchronous notifications (webhooks).

### 1. Checkout Session Creation
- **Trigger**: User clicks "Proceed to Checkout" in the frontend.
- **Action**: Frontend calls `POST /api/payments/checkout/session`.
- **Backend**:
  - Validates cart contents and stock.
  - Creates a Stripe `Checkout Session` containing line items, success/cancel URLs, and metadata (order ID, user ID).
  - Returns the session ID to the frontend.
- **Frontend**: Redirects the user to the Stripe-hosted checkout page.

### 2. Post-Payment Processing
Bookly uses a dual-verification strategy to ensure orders are completed reliably:

#### A. Session Verification (Synchronous Fallback)
When a user returns to the `success_url` (Dashboard), the frontend calls `POST /api/payments/verify-session`.
- This ensures that stock is updated and the cart is cleared immediately for the user currently in the session.
- It provides a smooth UX even if webhooks are delayed.

#### B. Webhooks (Asynchronous Primary)
Stripe sends a `checkout.session.completed` event to `POST /api/payments/webhook`.
- This is the most reliable way to process payments.
- The backend verifies the Stripe signature for security.
- It performs the same stock update and cart clearing logic as the verification endpoint.

### 3. Inventory Protection
Stock updates are **idempotent**. The system checks the order status before decrementing stock to prevent double-counting if both the verification endpoint and the webhook fire simultaneously.

### 4. Special Logic: Zero-Stock Auto-Deletion
As per project requirements, if a book's stock reaches exactly **0** after a successful purchase, the system automatically deletes the book listing from the database to ensure only available items are visible.

## Key Files
- `backend/app/api/payment.py`: Core logic for sessions, webhooks, and verification.
- `frontend/lib/api/payment.ts`: Frontend client for Stripe interactions.
- `backend/app/core/config.py`: Configuration for Stripe secrets.
