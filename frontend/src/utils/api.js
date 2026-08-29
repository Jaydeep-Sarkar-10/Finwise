const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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