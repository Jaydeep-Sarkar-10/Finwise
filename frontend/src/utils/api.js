let API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://finwise-utv7.onrender.com";

// Force HTTPS for production URLs to prevent 301 redirects that strip the Authorization header
if (API_BASE_URL.startsWith("http://") && !API_BASE_URL.includes("localhost") && !API_BASE_URL.includes("127.0.0.1")) {
  API_BASE_URL = API_BASE_URL.replace("http://", "https://");
}

export const apiFetch = async (url, options = {}) => {
  let accessToken = localStorage.getItem("access");

  const makeRequest = async (token) => {
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });
  };

  // =========================
  // FIRST REQUEST
  // =========================

  let response = await makeRequest(accessToken);

  // =========================
  // ACCESS TOKEN EXPIRED
  // =========================

  if (response.status === 401) {
    const refreshToken =
      localStorage.getItem("refresh");

    if (!refreshToken) {
      return response;
    }

    try {
      const refreshResponse = await fetch(
        `${API_BASE_URL}/api/auth/token/refresh/`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      // =========================
      // REFRESH TOKEN ALSO EXPIRED
      // =========================

      if (!refreshResponse.ok) {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("user");
        
        window.location.href = "/";

        return response;
      }

      const refreshData =
        await refreshResponse.json();

      const newAccessToken =
        refreshData.access;

      localStorage.setItem(
        "access",
        newAccessToken
      );

      // =========================
      // RETRY ORIGINAL REQUEST
      // =========================

      response = await makeRequest(
        newAccessToken
      );

    } catch (error) {
      console.error(
        "Token refresh failed:",
        error
      );
    }
  }

  return response;
};