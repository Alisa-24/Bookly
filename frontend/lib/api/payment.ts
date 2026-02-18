import { API_BASE_URL, fetchWithAuth, formatErrorMessage } from "../api";

export const paymentAPI = {
  // Create checkout session
  async createCheckoutSession(cartId: number) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/checkout/session`,
      {
        method: "POST",
        body: JSON.stringify({ cart_id: cartId }),
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to create checkout session",
      );
    }

    return response.json();
  },

  // Create payment intent
  async createPaymentIntent(cartId: number) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/payment-intent`,
      {
        method: "POST",
        body: JSON.stringify({ cart_id: cartId }),
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to create payment intent",
      );
    }

    return response.json();
  },

  // Get user orders
  async getOrders() {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/orders`,
      {
        method: "GET",
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to fetch orders",
      );
    }

    return response.json();
  },

  // Get specific order
  async getOrder(orderId: number) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/orders/${orderId}`,
      {
        method: "GET",
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to fetch order",
      );
    }

    return response.json();
  },

  // Verify Stripe session (fallback for webhooks)
  async verifySession(sessionId: string) {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/payments/verify-session`,
      {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId }),
      },
      true,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        formatErrorMessage(error.detail) || "Failed to verify session",
      );
    }

    return response.json();
  },
};
