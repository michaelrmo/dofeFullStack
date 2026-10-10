export async function requestJson(url, options) {
  // Standalone production builds retain the original hosted API address.
  // Docker explicitly sets an empty base so Nginx proxies same-origin calls.
  const apiBase = process.env.REACT_APP_API_BASE_URL
    ?? (process.env.NODE_ENV === "development" ? "" : "https://botpulse.xyz");
  const requestUrl = `${apiBase.trim().replace(/\/$/, "")}${url}`;
  let response;
  try {
    response = await fetch(requestUrl, options);
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }

  // A proxy can return HTML when the backend is unavailable.
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`The server returned an unexpected response (HTTP ${response.status}). Please try again.`);
  }

  if (!response.ok) {
    const message = data?.msg || data?.message;
    throw new Error(
      typeof message === "string"
        ? message
        : `The request failed (HTTP ${response.status}). Please try again.`
    );
  }
  return data;
}
