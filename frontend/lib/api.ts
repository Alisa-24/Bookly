const API_BASE_URL = "http://localhost:8000";

const getHeaders = (requireAuth = false) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (requireAuth) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiClient = {
  async login(email: string, password: string) {
    // FastAPI Users expects form data, not JSON
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle both string and array error details
      if (Array.isArray(error.detail)) {
        const messages = error.detail
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .join(", ");
        throw new Error(messages || "Login failed");
      }
      throw new Error(error.detail || "Login failed");
    }

    return response.json();
  },

  async register(name: string, email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        password,
        full_name: name || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      // Handle both string and array error details
      if (Array.isArray(error.detail)) {
        const messages = error.detail
          .map((e: any) => e.msg || e.message || JSON.stringify(e))
          .join(", ");
        throw new Error(messages || "Registration failed");
      }
      throw new Error(error.detail || "Registration failed");
    }

    return response.json();
  },

  async googleCallback(code: string) {
    const response = await fetch(`${API_BASE_URL}/auth/google/callback`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Google authentication failed");
    }

    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    localStorage.removeItem("auth_token");
    return response.json();
  },

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: getHeaders(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch current user");
    }

    return response.json();
  },
};
