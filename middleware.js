import { publishedOrigins } from './server/published-origin.js';

// Never serve login/dashboard/app assets on the untrusted publication origin.
export default function middleware(request) {
  let origins;
  try { origins = publishedOrigins(); } catch { return; }
  const url = new URL(request.url);
  if (url.origin !== origins.pages) return;
  const allowed = /^\/p\/[a-z0-9-]+$/.test(url.pathname) || [
    '/api/published-page', '/landing-ai.js', '/api/ai/chat',
    '/api/stripe/create-checkout-session', '/api/stripe/verify-session',
  ].includes(url.pathname);
  if (allowed) return;
  // Drop untrusted query/fragment, including potential auth callback values.
  return Response.redirect(origins.app, 307);
}

export const config = { matcher: '/:path*' };
