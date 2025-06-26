import React, { createContext, useState, useEffect, useContext } from 'react';

// Create the authentication context
export const AuthContext = createContext();

// Hook for easy access to the auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is already logged in (from local storage)
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setCurrentUser(JSON.parse(user));
        }
        setLoading(false);
    }, []);

    // Sign up function
    const signup = async (name, email, password) => {
        try {
            setError(null);
            // For a real app, you would call your backend API here
            // const response = await fetch('https://api.example.com/signup', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({ name, email, password }),
            // });
            // 
            // const data = await response.json();
            // 
            // if (!response.ok) {
            //   throw new Error(data.message || 'Failed to sign up');
            // }
            // 
            // // Store user data and token
            // localStorage.setItem('user', JSON.stringify(data.user));
            // localStorage.setItem('token', data.token);
            // setCurrentUser(data.user);
            // return data.user;

            // For demo purposes without backend:
            const mockUser = { id: Date.now().toString(), name, email };
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', 'mock-jwt-token');
            setCurrentUser(mockUser);
            return mockUser;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Login function
    const login = async (email, password) => {
        try {
            setError(null);
            // For a real app, you would call your backend API here
            // const response = await fetch('https://api.example.com/login', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify({ email, password }),
            // });
            // 
            // const data = await response.json();
            // 
            // if (!response.ok) {
            //   throw new Error(data.message || 'Failed to log in');
            // }
            // 
            // // Store user data and token
            // localStorage.setItem('user', JSON.stringify(data.user));
            // localStorage.setItem('token', data.token);
            // setCurrentUser(data.user);
            // return data.user;

            // For demo purposes without backend:
            // In a real app, validate credentials against backend
            const mockUser = { id: '123', name: 'Demo User', email };
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', 'mock-jwt-token');
            setCurrentUser(mockUser);
            return mockUser;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        loading,
        error,
        signup,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};