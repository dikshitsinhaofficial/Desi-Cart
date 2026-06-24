// Shared API base URL — used by all frontend pages and components
// On Vercel: set NEXT_PUBLIC_API_URL to your backend URL in Vercel project settings.
// Locally: falls back to http://localhost:5000
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default API;
