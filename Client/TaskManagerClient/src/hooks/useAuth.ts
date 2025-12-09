import { useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister, RegisterRequest } from "../Components/Api/authApi.ts";
import {useNavigate} from "react-router";

type UserData = Omit<User, 'accessToken' | 'refreshToken'>;
type Tokens = { accessToken: string; refreshToken: string; };

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserFromStorage = () => {
            const savedUser = localStorage.getItem('currentUser');
            const savedTokens = localStorage.getItem('authTokens');

            if (savedUser && savedTokens) {
                try {
                    const parsedUserData = JSON.parse(savedUser) as UserData;
                    const parsedTokens = JSON.parse(savedTokens) as Tokens;

                    const fullUser: User = { ...parsedUserData, ...parsedTokens };

                    setCurrentUser(fullUser);

                } catch (error) {
                    console.error('Failed to parse saved user or tokens:', error);
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('authTokens');
                }
            }

            setLoading(false);
        };

        loadUserFromStorage();
    }, []);

    useEffect(() => {
        if (loading) {
            return;
        }

        if (currentUser) {
            const userData: UserData = {
                username: currentUser.username,
                email: currentUser.email,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
            };
            const tokens: Tokens = {
                accessToken: currentUser.accessToken,
                refreshToken: currentUser.refreshToken,
            };

            localStorage.setItem('currentUser', JSON.stringify(userData));
            localStorage.setItem('authTokens', JSON.stringify(tokens));
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTokens');
        }
    }, [currentUser, loading]);


    const login = async (email: string, password: string): Promise<User> => {
        try {
            const response = await apiLogin(email, password);

            const loggedInUser: User = {
                username: response.user.username,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
            };

            setCurrentUser(loggedInUser);
            return loggedInUser;

        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterRequest): Promise<User> => {
        try {
            const response = await apiRegister(data);
            const registeredUser: User = {
                username: response.user.username,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName,
                accessToken: response.accessToken,
                refreshToken: response.refreshToken,
            };

            setCurrentUser(registeredUser);
            return registeredUser;

        } catch (error) {
            throw error;
        }
    }

    const logout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authTokens');
        setCurrentUser(null);
        navigate("/login")
    };

    return {
        currentUser,
        loading,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout
    };
};