export function publishedOrigins(env = process.env) {
  const app = new URL(env.APP_ORIGIN || '');
  const pages = new URL(env.PUBLISHED_PAGES_ORIGIN || '');
  for (const url of [app, pages]) {
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
      throw new Error('Invalid publication origin configuration');
    }
  }
  if (app.hostname === pages.hostname) throw new Error('Published pages require a separate host');
  return { app: app.origin, pages: pages.origin };
}
