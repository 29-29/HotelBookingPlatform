import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiClient from '../services/apiClient';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: async (email, password) => {
                const response = await apiClient.post('/Auth/login', { email, password });
                // Backend returns a flat object: { id, email, firstName, lastName, token, role, expiration }
                const { token, role, id, firstName, lastName, expiration, ...rest } = response.data;
                const user = { id, email: rest.email ?? email, firstName, lastName, role };
                set({ user, token, isAuthenticated: true });
                localStorage.setItem('token', token);
            },

            register: async (userData) => {
                // e.g. { firstName, lastName, email, password, confirmPassword }
                const response = await apiClient.post('/Auth/register', userData);
                // Also map flat response for register-then-auto-login scenarios
                const { token, role, id, firstName, lastName, expiration, ...rest } = response.data;
                const user = { id, email: rest.email, firstName, lastName, role };
                return { user, token };
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
            },

            // Used if we need to hydrate the user data based on just having a valid token
            fetchProfile: async () => {
                try {
                    const response = await apiClient.get('/Auth/me');
                    set({ user: response.data, isAuthenticated: true });
                } catch (err) {
                    set({ user: null, token: null, isAuthenticated: false });
                    localStorage.removeItem('token');
                }
            }
        }),
        {
            name: 'auth-storage', // name of item in storage (must be unique)
            partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
        }
    )
);

export default useAuthStore;
