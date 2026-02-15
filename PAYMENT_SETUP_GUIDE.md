# Stripe Payment Setup Guide

Follow these steps to configure Stripe payments for your Bookly installation.

## 1. Stripe Account Setup
1. Create a [Stripe account](https://dashboard.stripe.com/register).
2. Navigate to the [Developers Dashboard](https://dashboard.stripe.com/test/dashboard).
3. Toggle "Test Mode" on the top right.

## 2. API Keys Configuration
You need two keys: **Publishable Key** and **Secret Key**.

### Backend Configuration
Create or edit `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### Frontend Configuration
Create or edit `frontend/.env.local`:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

## 3. Webhook Integration (Highly Recommended)
Webhooks ensure that stock is updated even if the user closes their browser before returning to the dashboard.

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks).
2. Click "Add endpoint".
3. Use your public URL (or local tunnel) followed by `/api/payments/webhook`.
   - Example: `https://your-domain.com/api/payments/webhook`
4. Select the event: `checkout.session.completed`.
5. Get your **Webhook Signing Secret** (starts with `whsec_`) and add it to `backend/.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Local Testing with Stripe CLI
If you are developing locally:
1. [Install Stripe CLI](https://stripe.com/docs/stripe-cli).
2. Run `stripe login`.
3. Start forwarding:
```bash
stripe listen --forward-to localhost:8000/api/payments/webhook
```
4. Copy the secret provided by the CLI to your `.env` file.

## 4. Testing Payments
Use [Stripe Test Cards](https://stripe.com/docs/testing) to verify the flow.
- A common test card is `4242 4242 4242 4242` with any future expiry and any CVC.
