import { createContext, useState, useEffect, useContext } from 'react';
import { apiService } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            console.log('🔍 AuthContext: checkUserLoggedIn started');
            // Optimistic UI: Load from localStorage first
            const storedUser = localStorage.getItem('userInfo');
            const storedToken = localStorage.getItem('authToken');

            console.log('🔍 AuthContext: Storage check', {
                hasStoredUser: !!storedUser,
                hasStoredToken: !!storedToken
            });

            if (storedUser && storedToken) {
                try {
                    // Fix for "undefined" string causing SyntaxError
                    if (storedUser === 'undefined') {
                        throw new Error('Stored user is "undefined" string');
                    }
                    const parsedUser = JSON.parse(storedUser);
                    console.log('✅ AuthContext: Optimistic Login Success', parsedUser);
                    setUser(parsedUser);
                    setLoading(false);
                } catch (e) {
                    console.error('❌ AuthContext: Failed to parse stored user info', e);
                    // Corrupted data? Clear it.
                    localStorage.removeItem('userInfo');
                    // Don't return here, let the server verification attempt to fix it or fail gracefully
                }
            }

            // Fallback: If no token is found locally, do NOT attempt to verify with server.
            // This prevents "Zombie Cookies" (which failed to clear on logout) from resurrecting the session.
            // Exception: If we are on Desktop and rely on Cookies only, this might be strict, 
            // but since we moved to Hybrid Auth, we expect a token.
            if (!storedToken && !storedUser) {
                console.log('ℹ️ AuthContext: No token/user found. Stopping check.');
                setLoading(false);
                return;
            }

            try {
                console.log('⏳ AuthContext: Verifying session with server...');
                // Verify session with server (works for both Cookie and Bearer Token)
                // Add a race condition: If server takes > 5 seconds, fail fast so app loads
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session verification check timed out')), 5000)
                );

                const data = await Promise.race([
                    apiService.getProfile(),
                    timeoutPromise
                ]);

                console.log('✅ AuthContext: Server Verification Success', data);
                // Update with fresh data from server
                setUser(data.data);
                localStorage.setItem('userInfo', JSON.stringify(data.data));
            } catch (err) {
                console.warn('⚠️ AuthContext: Session verification failed:', err.message);
                // If token exists but failed, it might be expired
                if (err.response?.status === 401) {
                    console.log('❌ AuthContext: 401 detected during verification. Clearing session.');
                    setUser(null);
                    localStorage.removeItem('userInfo');
                    localStorage.removeItem('authToken');
                }
            } finally {
                // Ensure loading is set to false even if optimistic load happened earlier, 
                // to cover the async verification part if it finished later (though state might already be false)
                setLoading(false);
                console.log('🏁 AuthContext: checkUserLoggedIn finished. Loading set to false.');
            }
        };
        checkUserLoggedIn();

        // Listen for global 401 unauthorized events from apiService
        const handleUnauthorized = (e) => {
            console.warn('⚠️ Global 401 Unauthorized Event Triggered', e);
            setUser(null);
            localStorage.removeItem('userInfo');
            localStorage.removeItem('authToken');
            window.dispatchEvent(new Event('userChanged'));
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const data = await apiService.login({ email, password });

            setUser(data.data);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Store token for Hybrid Auth
            }
            // Dispatch custom event to notify cart of user change
            window.dispatchEvent(new Event('userChanged'));
            return true;
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
            return false;
        }
    };

    const register = async (name, email, password, mobile = '') => {
        try {
            setError(null);
            const data = await apiService.register({ name, email, password, mobile });

            setUser(data.data);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Store token for Hybrid Auth
            }
            // Dispatch custom event to notify cart of user change
            window.dispatchEvent(new Event('userChanged'));
            return true;
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
            return false;
        }
    };

    const googleLogin = async (authData) => {
        try {
            setError(null);
            // Support both structure: { credential } or { accessToken }
            const data = await apiService.googleAuth(authData);

            setUser(data.data);
            localStorage.setItem('userInfo', JSON.stringify(data.data));
            if (data.token) {
                localStorage.setItem('authToken', data.token); // Store token for Hybrid Auth
            }
            // Dispatch custom event to notify cart of user change
            window.dispatchEvent(new Event('userChanged'));
            return true;
        } catch (err) {
            setError(
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message
            );
            return false;
        }
    };

    const logout = async () => {
        try {
            await apiService.logout();
        } catch (err) {
            console.error('Logout failed on server', err);
        }
        localStorage.removeItem('userInfo');
        localStorage.removeItem('authToken'); // Cleanup legacy
        setUser(null);
        // Dispatch custom event to notify cart of user change
        window.dispatchEvent(new Event('userChanged'));
    };

    const updateUserState = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    const refreshUser = async () => {
        try {
            const data = await apiService.getProfile();
            if (data && data.data) {
                setUser(data.data);
                localStorage.setItem('userInfo', JSON.stringify(data.data));
                return data.data;
            }
        } catch (err) {
            console.error('Failed to refresh user profile:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser: updateUserState, login, register, googleLogin, logout, loading, error, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
