// Shared API base URL — used by all frontend pages and components
// On Vercel: relative URLs work seamlessly.
const API = process.env.NEXT_PUBLIC_API_URL || '';

export default API;
