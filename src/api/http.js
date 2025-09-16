/**
 * Base URL for API requests.
 * 
 * Loaded from Vite environment variables (`VITE_API_URL`).
 */
const BASE_URL = import.meta.env.VITE_API_URL;


/**
 * Generic HTTP request helper using Fetch API.
 *
 * Automatically stringifies the request body (if provided),
 * sets default headers (`Content-Type: application/json`),
 * includes credentials for cookie support,
 * and parses JSON responses.
 *
 * @async
 * @param {string} path - API path (relative to BASE_URL).
 * @param {Object} [options={}] - Request options.
 * @param {string} [options.method='GET'] - HTTP method (GET, POST, PUT, DELETE).
 * @param {Object} [options.headers={}] - Additional request headers.
 * @param {Object} [options.body] - Request body (will be JSON.stringified).
 * @returns {Promise<any>} The parsed response payload (JSON if available).
 * @throws {Error} If the response is not OK (status >= 400), throws with message.
 */
async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include', // ADDED: This enables HttpOnly cookies
    body: body ? JSON.stringify(body) : undefined,
  });

  const isJSON = res.headers.get('content-type')?.includes('application/json');
  const payload = isJSON ? await res.json().catch(() => null) : null;

  if (!res.ok) {
  const msg = payload?.message || payload?.error || `HTTP ${res.status}`;
  throw {
    status: res.status,
    message: msg,
    payload,
  };
}


  return payload;
}

/**
 * Convenience HTTP client.
 * Provides shorthand methods for common HTTP verbs.
 */
export const http = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body, ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body, ...opts }),
  del: (path, opts) => request(path, { method: 'DELETE', ...opts }),
};