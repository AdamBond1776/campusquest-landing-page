import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Link preview scrapers do not resolve relative og:image paths reliably, so the
 * meta tags in index.html carry a %SITE_URL% placeholder that is filled in at
 * build time from VITE_SITE_URL. Without that variable the placeholder
 * collapses to a root-relative path, which still works locally and degrades
 * gracefully.
 *
 * The placeholder is confined to `content` attributes on purpose: Vite treats
 * `link[href]` as an asset reference and runs it through decodeURI, where a
 * bare `%SI` reads as a malformed escape and fails the build. The canonical
 * link is therefore injected here rather than written inline.
 */
function siteUrlPlugin(siteUrl: string): Plugin {
  return {
    name: 'campusquest-site-url',
    transformIndexHtml(html) {
      const replaced = html.replaceAll('%SITE_URL%', siteUrl);
      if (!siteUrl) return replaced;

      return {
        html: replaced,
        tags: [
          {
            tag: 'link',
            attrs: { rel: 'canonical', href: `${siteUrl}/` },
            injectTo: 'head',
          },
        ],
      };
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = (env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');

  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
