// vite.config.js
import { defineConfig } from "file:///D:/Antigravity-Homly%20app/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Antigravity-Homly%20app/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/Antigravity-Homly%20app/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  clearScreen: false,
  plugins: [
    react()
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    //   manifest: {
    //     name: 'Homly - E-Commerce App',
    //     short_name: 'Homly',
    //     description: 'Your one-stop shop for all your needs. Browse products, manage orders, and shop with ease.',
    //     theme_color: '#2563eb',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     scope: '/',
    //     start_url: '/',
    //     orientation: 'portrait-primary',
    //     categories: ['shopping', 'lifestyle'],
    //     icons: [
    //       {
    //         src: '/icon-192x192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       },
    //       {
    //         src: '/icon-512x512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable'
    //       }
    //     ],
    //     shortcuts: [
    //       {
    //         name: 'Browse Products',
    //         short_name: 'Shop',
    //         description: 'Browse all products',
    //         url: '/store',
    //         icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }]
    //       },
    //       {
    //         name: 'My Orders',
    //         short_name: 'Orders',
    //         description: 'View your orders',
    //         url: '/orders',
    //         icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }]
    //       },
    //       {
    //         name: 'Shopping Cart',
    //         short_name: 'Cart',
    //         description: 'View your cart',
    //         url: '/cart',
    //         icons: [{ src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' }]
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'google-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
    //         handler: 'CacheFirst',
    //         options: {
    //           cacheName: 'gstatic-fonts-cache',
    //           expiration: {
    //             maxEntries: 10,
    //             maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         // Cache public data (Products, News, Ads, Stores, Categories, Services)
    //         urlPattern: /\/api\/(products|news|ads|stores|categories|services).*/i,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'public-api-cache',
    //           expiration: {
    //             maxEntries: 100,
    //             maxAgeSeconds: 60 * 5 // 5 minutes
    //           },
    //           cacheableResponse: {
    //             statuses: [0, 200]
    //           }
    //         }
    //       },
    //       {
    //         // NEVER cache sensitive user data (Orders, User Profile, Cart, Service Requests)
    //         urlPattern: /\/api\/(orders|users|service-requests).*/i,
    //         handler: 'NetworkOnly', // Force network, fail if offline (to protect data)
    //         options: {
    //           backgroundSync: {
    //             name: 'sensitive-data-queue',
    //             options: {
    //               maxRetentionTime: 24 * 60 // Retry for 24 hours
    //             }
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   devOptions: {
    //     enabled: true,
    //     type: 'module'
    //   }
    // })
  ],
  server: {
    host: "127.0.0.1",
    // Force IPv4 for reliable localhost
    port: 5173,
    strictPort: false
  },
  preview: {
    port: 5173
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBbnRpZ3Jhdml0eS1Ib21seSBhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEFudGlncmF2aXR5LUhvbWx5IGFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQW50aWdyYXZpdHktSG9tbHklMjBhcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgLy8gVml0ZVBXQSh7XHJcbiAgICAvLyAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgLy8gICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ3JvYm90cy50eHQnLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnXSxcclxuICAgIC8vICAgbWFuaWZlc3Q6IHtcclxuICAgIC8vICAgICBuYW1lOiAnSG9tbHkgLSBFLUNvbW1lcmNlIEFwcCcsXHJcbiAgICAvLyAgICAgc2hvcnRfbmFtZTogJ0hvbWx5JyxcclxuICAgIC8vICAgICBkZXNjcmlwdGlvbjogJ1lvdXIgb25lLXN0b3Agc2hvcCBmb3IgYWxsIHlvdXIgbmVlZHMuIEJyb3dzZSBwcm9kdWN0cywgbWFuYWdlIG9yZGVycywgYW5kIHNob3Agd2l0aCBlYXNlLicsXHJcbiAgICAvLyAgICAgdGhlbWVfY29sb3I6ICcjMjU2M2ViJyxcclxuICAgIC8vICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAvLyAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgLy8gICAgIHNjb3BlOiAnLycsXHJcbiAgICAvLyAgICAgc3RhcnRfdXJsOiAnLycsXHJcbiAgICAvLyAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdC1wcmltYXJ5JyxcclxuICAgIC8vICAgICBjYXRlZ29yaWVzOiBbJ3Nob3BwaW5nJywgJ2xpZmVzdHlsZSddLFxyXG4gICAgLy8gICAgIGljb25zOiBbXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIHNyYzogJy9pY29uLTE5MngxOTIucG5nJyxcclxuICAgIC8vICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgIC8vICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAvLyAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICBzcmM6ICcvaWNvbi01MTJ4NTEyLnBuZycsXHJcbiAgICAvLyAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAvLyAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgLy8gICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgIF0sXHJcbiAgICAvLyAgICAgc2hvcnRjdXRzOiBbXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIG5hbWU6ICdCcm93c2UgUHJvZHVjdHMnLFxyXG4gICAgLy8gICAgICAgICBzaG9ydF9uYW1lOiAnU2hvcCcsXHJcbiAgICAvLyAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJvd3NlIGFsbCBwcm9kdWN0cycsXHJcbiAgICAvLyAgICAgICAgIHVybDogJy9zdG9yZScsXHJcbiAgICAvLyAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH1dXHJcbiAgICAvLyAgICAgICB9LFxyXG4gICAgLy8gICAgICAge1xyXG4gICAgLy8gICAgICAgICBuYW1lOiAnTXkgT3JkZXJzJyxcclxuICAgIC8vICAgICAgICAgc2hvcnRfbmFtZTogJ09yZGVycycsXHJcbiAgICAvLyAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIG9yZGVycycsXHJcbiAgICAvLyAgICAgICAgIHVybDogJy9vcmRlcnMnLFxyXG4gICAgLy8gICAgICAgICBpY29uczogW3sgc3JjOiAnL2ljb24tMTkyeDE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9XVxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgbmFtZTogJ1Nob3BwaW5nIENhcnQnLFxyXG4gICAgLy8gICAgICAgICBzaG9ydF9uYW1lOiAnQ2FydCcsXHJcbiAgICAvLyAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIGNhcnQnLFxyXG4gICAgLy8gICAgICAgICB1cmw6ICcvY2FydCcsXHJcbiAgICAvLyAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH1dXHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgXVxyXG4gICAgLy8gICB9LFxyXG4gICAgLy8gICB3b3JrYm94OiB7XHJcbiAgICAvLyAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdlYnB9J10sXHJcbiAgICAvLyAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAvLyAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgIC8vICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgLy8gICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgIC8vICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgLy8gICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgLy8gICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgIC8vICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgLy8gICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxyXG4gICAgLy8gICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAvLyAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgIC8vICAgICAgICAgICBjYWNoZU5hbWU6ICdnc3RhdGljLWZvbnRzLWNhY2hlJyxcclxuICAgIC8vICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAvLyAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcclxuICAgIC8vICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSAvLyAxIHllYXJcclxuICAgIC8vICAgICAgICAgICB9LFxyXG4gICAgLy8gICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XHJcbiAgICAvLyAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cclxuICAgIC8vICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICAgIH0sXHJcbiAgICAvLyAgICAgICB7XHJcbiAgICAvLyAgICAgICAgIC8vIENhY2hlIHB1YmxpYyBkYXRhIChQcm9kdWN0cywgTmV3cywgQWRzLCBTdG9yZXMsIENhdGVnb3JpZXMsIFNlcnZpY2VzKVxyXG4gICAgLy8gICAgICAgICB1cmxQYXR0ZXJuOiAvXFwvYXBpXFwvKHByb2R1Y3RzfG5ld3N8YWRzfHN0b3Jlc3xjYXRlZ29yaWVzfHNlcnZpY2VzKS4qL2ksXHJcbiAgICAvLyAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxyXG4gICAgLy8gICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAvLyAgICAgICAgICAgY2FjaGVOYW1lOiAncHVibGljLWFwaS1jYWNoZScsXHJcbiAgICAvLyAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgLy8gICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgLy8gICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA1IC8vIDUgbWludXRlc1xyXG4gICAgLy8gICAgICAgICAgIH0sXHJcbiAgICAvLyAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgIC8vICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgLy8gICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfSxcclxuICAgIC8vICAgICAgIHtcclxuICAgIC8vICAgICAgICAgLy8gTkVWRVIgY2FjaGUgc2Vuc2l0aXZlIHVzZXIgZGF0YSAoT3JkZXJzLCBVc2VyIFByb2ZpbGUsIENhcnQsIFNlcnZpY2UgUmVxdWVzdHMpXHJcbiAgICAvLyAgICAgICAgIHVybFBhdHRlcm46IC9cXC9hcGlcXC8ob3JkZXJzfHVzZXJzfHNlcnZpY2UtcmVxdWVzdHMpLiovaSxcclxuICAgIC8vICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtPbmx5JywgLy8gRm9yY2UgbmV0d29yaywgZmFpbCBpZiBvZmZsaW5lICh0byBwcm90ZWN0IGRhdGEpXHJcbiAgICAvLyAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgIC8vICAgICAgICAgICBiYWNrZ3JvdW5kU3luYzoge1xyXG4gICAgLy8gICAgICAgICAgICAgbmFtZTogJ3NlbnNpdGl2ZS1kYXRhLXF1ZXVlJyxcclxuICAgIC8vICAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgIC8vICAgICAgICAgICAgICAgbWF4UmV0ZW50aW9uVGltZTogMjQgKiA2MCAvLyBSZXRyeSBmb3IgMjQgaG91cnNcclxuICAgIC8vICAgICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICAgIH1cclxuICAgIC8vICAgICBdXHJcbiAgICAvLyAgIH0sXHJcbiAgICAvLyAgIGRldk9wdGlvbnM6IHtcclxuICAgIC8vICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgLy8gICAgIHR5cGU6ICdtb2R1bGUnXHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0pXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLCAvLyBGb3JjZSBJUHY0IGZvciByZWxpYWJsZSBsb2NhbGhvc3RcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICB9LFxyXG4gIHByZXZpZXc6IHtcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUSxTQUFTLG9CQUFvQjtBQUM3UixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLGFBQWE7QUFBQSxFQUNiLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBdUhSO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
