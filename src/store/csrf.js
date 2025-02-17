import Cookies from "js-cookie";

let isFetchingCsrfToken = false; // Flag to prevent multiple fetch calls

export async function csrfFetch(url, options = {}) {
  options.headers = options.headers || {};
  options.method = options.method || "GET";
  
  if (options.method && options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] = options.headers['Content-Type'] || "application/json";
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }

  //--------------------------------------------------------
  const csrfToken = Cookies.get("XSRF-TOKEN");
  console.log("csrfToken", csrfToken);
  
// If the CSRF token is not available, fetch it
if (!csrfToken && !isFetchingCsrfToken) {
  console.log("CSRF token not found, fetching...");
  isFetchingCsrfToken = true; // Set the flag to indicate we're fetching the token

  try {
    const restoreResponse = await restoreCSRF();
    if (restoreResponse.ok) {
      // Retrieve the CSRF token again after restoring
      options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
    } else {
      throw new Error("Failed to restore CSRF token");
    }
  } finally {
    isFetchingCsrfToken = false; // Reset the flag after fetching
  }
}
  //--------------------------------------------------------

  console.log("url", url, "options", options);
  const response = await window.fetch(url, options);

  if (response.status >= 400) throw response;

  return response;
}

// This function fetches the CSRF token on page load
export function restoreCSRF() {
  return csrfFetch("https://airbnb-api-docs.onrender.com/api/csrf/restore");
}