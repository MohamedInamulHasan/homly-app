// vite.config.js
import { defineConfig } from "file:///D:/Antigravity-Homly%20app/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Antigravity-Homly%20app/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/Antigravity-Homly%20app/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  clearScreen: false,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Homly - E-Commerce App",
        short_name: "Homly",
        description: "Your one-stop shop for all your needs. Browse products, manage orders, and shop with ease.",
        theme_color: "#2563eb",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait-primary",
        categories: ["shopping", "lifestyle"],
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        shortcuts: [
          {
            name: "Browse Products",
            short_name: "Shop",
            description: "Browse all products",
            url: "/store",
            icons: [{ src: "/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "My Orders",
            short_name: "Orders",
            description: "View your orders",
            url: "/orders",
            icons: [{ src: "/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          },
          {
            name: "Shopping Cart",
            short_name: "Cart",
            description: "View your cart",
            url: "/cart",
            icons: [{ src: "/icon-192x192.png", sizes: "192x192", type: "image/png" }]
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "gstatic-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
                // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache public data (Products, News, Ads, Stores, Categories, Services)
            urlPattern: /\/api\/(products|news|ads|stores|categories|services).*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "public-api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5
                // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // NEVER cache sensitive user data (Orders, User Profile, Cart, Service Requests)
            urlPattern: /\/api\/(orders|users|service-requests).*/i,
            handler: "NetworkOnly",
            // Force network, fail if offline (to protect data)
            options: {
              backgroundSync: {
                name: "sensitive-data-queue",
                options: {
                  maxRetentionTime: 24 * 60
                  // Retry for 24 hours
                }
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: "module"
      }
    })
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxBbnRpZ3Jhdml0eS1Ib21seSBhcHBcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXEFudGlncmF2aXR5LUhvbWx5IGFwcFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQW50aWdyYXZpdHktSG9tbHklMjBhcHAvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXHJcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ3JvYm90cy50eHQnLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnXSxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiAnSG9tbHkgLSBFLUNvbW1lcmNlIEFwcCcsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogJ0hvbWx5JyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1lvdXIgb25lLXN0b3Agc2hvcCBmb3IgYWxsIHlvdXIgbmVlZHMuIEJyb3dzZSBwcm9kdWN0cywgbWFuYWdlIG9yZGVycywgYW5kIHNob3Agd2l0aCBlYXNlLicsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMjU2M2ViJyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIHNjb3BlOiAnLycsXHJcbiAgICAgICAgc3RhcnRfdXJsOiAnLycsXHJcbiAgICAgICAgb3JpZW50YXRpb246ICdwb3J0cmFpdC1wcmltYXJ5JyxcclxuICAgICAgICBjYXRlZ29yaWVzOiBbJ3Nob3BwaW5nJywgJ2xpZmVzdHlsZSddLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pY29uLTE5MngxOTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICcxOTJ4MTkyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBzcmM6ICcvaWNvbi01MTJ4NTEyLnBuZycsXHJcbiAgICAgICAgICAgIHNpemVzOiAnNTEyeDUxMicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICBwdXJwb3NlOiAnYW55IG1hc2thYmxlJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgc2hvcnRjdXRzOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdCcm93c2UgUHJvZHVjdHMnLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnU2hvcCcsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnJvd3NlIGFsbCBwcm9kdWN0cycsXHJcbiAgICAgICAgICAgIHVybDogJy9zdG9yZScsXHJcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH1dXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnTXkgT3JkZXJzJyxcclxuICAgICAgICAgICAgc2hvcnRfbmFtZTogJ09yZGVycycsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIG9yZGVycycsXHJcbiAgICAgICAgICAgIHVybDogJy9vcmRlcnMnLFxyXG4gICAgICAgICAgICBpY29uczogW3sgc3JjOiAnL2ljb24tMTkyeDE5Mi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJyB9XVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ1Nob3BwaW5nIENhcnQnLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnQ2FydCcsXHJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVmlldyB5b3VyIGNhcnQnLFxyXG4gICAgICAgICAgICB1cmw6ICcvY2FydCcsXHJcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH1dXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnLHdlYnB9J10sXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdvb2dsZWFwaXNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnb29nbGUtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC9mb250c1xcLmdzdGF0aWNcXC5jb21cXC8uKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnQ2FjaGVGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdnc3RhdGljLWZvbnRzLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMCxcclxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDM2NSAvLyAxIHllYXJcclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgIGNhY2hlYWJsZVJlc3BvbnNlOiB7XHJcbiAgICAgICAgICAgICAgICBzdGF0dXNlczogWzAsIDIwMF1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIENhY2hlIHB1YmxpYyBkYXRhIChQcm9kdWN0cywgTmV3cywgQWRzLCBTdG9yZXMsIENhdGVnb3JpZXMsIFNlcnZpY2VzKVxyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXFwvYXBpXFwvKHByb2R1Y3RzfG5ld3N8YWRzfHN0b3Jlc3xjYXRlZ29yaWVzfHNlcnZpY2VzKS4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAncHVibGljLWFwaS1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA1IC8vIDUgbWludXRlc1xyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgLy8gTkVWRVIgY2FjaGUgc2Vuc2l0aXZlIHVzZXIgZGF0YSAoT3JkZXJzLCBVc2VyIFByb2ZpbGUsIENhcnQsIFNlcnZpY2UgUmVxdWVzdHMpXHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9cXC9hcGlcXC8ob3JkZXJzfHVzZXJzfHNlcnZpY2UtcmVxdWVzdHMpLiovaSxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtPbmx5JywgLy8gRm9yY2UgbmV0d29yaywgZmFpbCBpZiBvZmZsaW5lICh0byBwcm90ZWN0IGRhdGEpXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBiYWNrZ3JvdW5kU3luYzoge1xyXG4gICAgICAgICAgICAgICAgbmFtZTogJ3NlbnNpdGl2ZS1kYXRhLXF1ZXVlJyxcclxuICAgICAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICAgICAgbWF4UmV0ZW50aW9uVGltZTogMjQgKiA2MCAvLyBSZXRyeSBmb3IgMjQgaG91cnNcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIGRldk9wdGlvbnM6IHtcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgIHR5cGU6ICdtb2R1bGUnXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLCAvLyBGb3JjZSBJUHY0IGZvciByZWxpYWJsZSBsb2NhbGhvc3RcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgICBzdHJpY3RQb3J0OiBmYWxzZSxcclxuICB9LFxyXG4gIHByZXZpZXc6IHtcclxuICAgIHBvcnQ6IDUxNzMsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnUSxTQUFTLG9CQUFvQjtBQUM3UixPQUFPLFdBQVc7QUFDbEIsU0FBUyxlQUFlO0FBR3hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLGFBQWE7QUFBQSxFQUNiLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLGVBQWUsQ0FBQyxlQUFlLGNBQWMsc0JBQXNCO0FBQUEsTUFDbkUsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsYUFBYTtBQUFBLFFBQ2IsWUFBWSxDQUFDLFlBQVksV0FBVztBQUFBLFFBQ3BDLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEs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
