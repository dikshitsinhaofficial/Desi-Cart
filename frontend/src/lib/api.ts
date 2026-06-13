// Shared API base URL — used by all frontend pages and components
// On Vercel: frontend and backend share the same domain, so we use relative /api paths.
// Locally: falls back to http://localhost:5000
const API = process.env.NEXT_PUBLIC_API_URL ?? '';

export default API;
