// vite.config.js
import { defineConfig } from "file:///D:/New%20Homly%20App/Homly-App-Clean/node_modules/vite/dist/node/index.js";
import react from "file:///D:/New%20Homly%20App/Homly-App-Clean/node_modules/@vitejs/plugin-react/dist/index.js";
import { VitePWA } from "file:///D:/New%20Homly%20App/Homly-App-Clean/node_modules/vite-plugin-pwa/dist/index.js";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxOZXcgSG9tbHkgQXBwXFxcXEhvbWx5LUFwcC1DbGVhblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcTmV3IEhvbWx5IEFwcFxcXFxIb21seS1BcHAtQ2xlYW5cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L05ldyUyMEhvbWx5JTIwQXBwL0hvbWx5LUFwcC1DbGVhbi92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgY2xlYXJTY3JlZW46IGZhbHNlLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBWaXRlUFdBKHtcclxuICAgICAgcmVnaXN0ZXJUeXBlOiAnYXV0b1VwZGF0ZScsXHJcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAncm9ib3RzLnR4dCcsICdhcHBsZS10b3VjaC1pY29uLnBuZyddLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdIb21seSAtIEUtQ29tbWVyY2UgQXBwJyxcclxuICAgICAgICBzaG9ydF9uYW1lOiAnSG9tbHknLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnWW91ciBvbmUtc3RvcCBzaG9wIGZvciBhbGwgeW91ciBuZWVkcy4gQnJvd3NlIHByb2R1Y3RzLCBtYW5hZ2Ugb3JkZXJzLCBhbmQgc2hvcCB3aXRoIGVhc2UuJyxcclxuICAgICAgICB0aGVtZV9jb2xvcjogJyMyNTYzZWInLFxyXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcclxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXHJcbiAgICAgICAgc2NvcGU6ICcvJyxcclxuICAgICAgICBzdGFydF91cmw6ICcvJyxcclxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0LXByaW1hcnknLFxyXG4gICAgICAgIGNhdGVnb3JpZXM6IFsnc2hvcHBpbmcnLCAnbGlmZXN0eWxlJ10sXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2ljb24tMTkyeDE5Mi5wbmcnLFxyXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxyXG4gICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgcHVycG9zZTogJ2FueSBtYXNrYWJsZSdcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogJy9pY29uLTUxMng1MTIucG5nJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgIHB1cnBvc2U6ICdhbnkgbWFza2FibGUnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXSxcclxuICAgICAgICBzaG9ydGN1dHM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgbmFtZTogJ0Jyb3dzZSBQcm9kdWN0cycsXHJcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdTaG9wJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdCcm93c2UgYWxsIHByb2R1Y3RzJyxcclxuICAgICAgICAgICAgdXJsOiAnL3N0b3JlJyxcclxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJy9pY29uLTE5MngxOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3BuZycgfV1cclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG5hbWU6ICdNeSBPcmRlcnMnLFxyXG4gICAgICAgICAgICBzaG9ydF9uYW1lOiAnT3JkZXJzJyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdWaWV3IHlvdXIgb3JkZXJzJyxcclxuICAgICAgICAgICAgdXJsOiAnL29yZGVycycsXHJcbiAgICAgICAgICAgIGljb25zOiBbeyBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsIHNpemVzOiAnMTkyeDE5MicsIHR5cGU6ICdpbWFnZS9wbmcnIH1dXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICBuYW1lOiAnU2hvcHBpbmcgQ2FydCcsXHJcbiAgICAgICAgICAgIHNob3J0X25hbWU6ICdDYXJ0JyxcclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICdWaWV3IHlvdXIgY2FydCcsXHJcbiAgICAgICAgICAgIHVybDogJy9jYXJ0JyxcclxuICAgICAgICAgICAgaWNvbnM6IFt7IHNyYzogJy9pY29uLTE5MngxOTIucG5nJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3BuZycgfV1cclxuICAgICAgICAgIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd2VicH0nXSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ29vZ2xlYXBpc1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dvb2dsZS1mb250cy1jYWNoZScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgbWF4RW50cmllczogMTAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgKiAzNjUgLy8gMSB5ZWFyXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2ZvbnRzXFwuZ3N0YXRpY1xcLmNvbVxcLy4qL2ksXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ2dzdGF0aWMtZm9udHMtY2FjaGUnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHtcclxuICAgICAgICAgICAgICAgIG1heEVudHJpZXM6IDEwLFxyXG4gICAgICAgICAgICAgICAgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzY1IC8vIDEgeWVhclxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgY2FjaGVhYmxlUmVzcG9uc2U6IHtcclxuICAgICAgICAgICAgICAgIHN0YXR1c2VzOiBbMCwgMjAwXVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgLy8gQ2FjaGUgcHVibGljIGRhdGEgKFByb2R1Y3RzLCBOZXdzLCBBZHMsIFN0b3JlcywgQ2F0ZWdvcmllcywgU2VydmljZXMpXHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46IC9cXC9hcGlcXC8ocHJvZHVjdHN8bmV3c3xhZHN8c3RvcmVzfGNhdGVnb3JpZXN8c2VydmljZXMpLiovaSxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ05ldHdvcmtGaXJzdCcsXHJcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAgICAgICBjYWNoZU5hbWU6ICdwdWJsaWMtYXBpLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiAxMDAsXHJcbiAgICAgICAgICAgICAgICBtYXhBZ2VTZWNvbmRzOiA2MCAqIDUgLy8gNSBtaW51dGVzXHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZToge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzZXM6IFswLCAyMDBdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICAvLyBORVZFUiBjYWNoZSBzZW5zaXRpdmUgdXNlciBkYXRhIChPcmRlcnMsIFVzZXIgUHJvZmlsZSwgQ2FydCwgU2VydmljZSBSZXF1ZXN0cylcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcL2FwaVxcLyhvcmRlcnN8dXNlcnN8c2VydmljZS1yZXF1ZXN0cykuKi9pLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya09ubHknLCAvLyBGb3JjZSBuZXR3b3JrLCBmYWlsIGlmIG9mZmxpbmUgKHRvIHByb3RlY3QgZGF0YSlcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGJhY2tncm91bmRTeW5jOiB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiAnc2Vuc2l0aXZlLWRhdGEtcXVldWUnLFxyXG4gICAgICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgICAgICBtYXhSZXRlbnRpb25UaW1lOiAyNCAqIDYwIC8vIFJldHJ5IGZvciAyNCBob3Vyc1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgZGV2T3B0aW9uczoge1xyXG4gICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgdHlwZTogJ21vZHVsZSdcclxuICAgICAgfVxyXG4gICAgfSlcclxuICBdLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogJzEyNy4wLjAuMScsIC8vIEZvcmNlIElQdjQgZm9yIHJlbGlhYmxlIGxvY2FsaG9zdFxyXG4gICAgcG9ydDogNTE3MyxcclxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxyXG4gIH0sXHJcbiAgcHJldmlldzoge1xyXG4gICAgcG9ydDogNTE3MyxcclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRSLFNBQVMsb0JBQW9CO0FBQ3pULE9BQU8sV0FBVztBQUNsQixTQUFTLGVBQWU7QUFHeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsYUFBYTtBQUFBLEVBQ2IsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsY0FBYyxzQkFBc0I7QUFBQSxNQUNuRSxVQUFVO0FBQUEsUUFDUixNQUFNO0FBQUEsUUFDTixZQUFZO0FBQUEsUUFDWixhQUFhO0FBQUEsUUFDYixhQUFhO0FBQUEsUUFDYixrQkFBa0I7QUFBQSxRQUNsQixTQUFTO0FBQUEsUUFDVCxPQUFPO0FBQUEsUUFDUCxXQUFXO0FBQUEsUUFDWCxhQUFhO0FBQUEsUUFDYixZQUFZLENBQUMsWUFBWSxXQUFXO0FBQUEsUUFDcEMsT0FB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
