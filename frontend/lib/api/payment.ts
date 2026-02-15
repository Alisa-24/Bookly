const API_BASE_URL = "http://localhost:8000";

const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  const token = localStorage.getItem("auth_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const paymentAPI = {
  // Create checkout session
  async createCheckoutSession(cartId: number) {
    const response = await fetch(`${API_BASE_URL}/payments/checkout/session`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ cart_id: cartId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create checkout session");
    }

    return response.json();
  },

  // Create payment intent
  async createPaymentIntent(cartId: number) {
    const response = await fetch(`${API_BASE_URL}/payments/payment-intent`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ cart_id: cartId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create payment intent");
    }

    return response.json();
  },

  // Get user orders
  async getOrders() {
    const response = await fetch(`${API_BASE_URL}/payments/orders`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch orders");
    }

    return response.json();
  },

  // Get specific order
  async getOrder(orderId: number) {
    const response = await fetch(`${API_BASE_URL}/payments/orders/${orderId}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to fetch order");
    }

    return response.json();
  },

  // Verify Stripe session (fallback for webhooks)
  async verifySession(sessionId: string) {
    const response = await fetch(`${API_BASE_URL}/payments/verify-session`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ session_id: sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to verify session");
    }

    return response.json();
  },
};
