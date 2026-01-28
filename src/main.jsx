import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { DataProvider } from './context/DataContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { LanguageProvider } from './context/LanguageContext.jsx'
// import { registerSW } from 'virtual:pwa-register'
// 
// const updateSW = registerSW({
//     onNeedRefresh() {
//         if (confirm('New content available. Reload?')) {
//             updateSW(true)
//         }
//     },
// })

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <LanguageProvider>
                        <DataProvider>
                            <CartProvider>
                                <App />
                            </CartProvider>
                        </DataProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
