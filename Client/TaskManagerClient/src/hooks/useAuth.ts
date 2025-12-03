import { useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister, RegisterRequest } from "../Components/Api/authApi.ts";

// Определяем типы данных, которые будут сохраняться отдельно
type UserData = Omit<User, 'accessToken' | 'refreshToken'>;
type Tokens = { accessToken: string; refreshToken: string; };

export const useAuth = () => {
    // 1. Состояние пользователя
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // 2. Состояние загрузки (Ключевое для правильного рендера)
    const [loading, setLoading] = useState(true);

    // =========================================================
    // 🚀 Эффект для ЧТЕНИЯ ИЗ localStorage (Запускается 1 раз)
    // =========================================================
    useEffect(() => {
        const loadUserFromStorage = () => {
            const savedUser = localStorage.getItem('currentUser');
            const savedTokens = localStorage.getItem('authTokens');

            if (savedUser && savedTokens) {
                try {
                    const parsedUserData = JSON.parse(savedUser) as UserData;
                    const parsedTokens = JSON.parse(savedTokens) as Tokens;

                    const fullUser: User = { ...parsedUserData, ...parsedTokens };

                    // Устанавливаем пользователя синхронно, но только в одном месте,
                    // избегая проблем с каскадным рендером
                    setCurrentUser(fullUser);

                } catch (error) {
                    console.error('Failed to parse saved user or tokens:', error);
                    // Очищаем невалидные данные
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('authTokens');
                }
            }

            // 💡 ВАЖНО: Устанавливаем loading в false после завершения проверки
            setLoading(false);
        };

        loadUserFromStorage();
        // Зависимости отсутствуют ([]), хук запускается только при монтировании
    }, []);

    // =========================================================
    // 💾 Эффект для ЗАПИСИ В localStorage (Запускается при изменении currentUser)
    // =========================================================
    useEffect(() => {
        if (loading) {
            // Игнорируем запуск эффекта, пока идет начальная загрузка
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
            // Очистка при логауте
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authTokens');
        }
    }, [currentUser, loading]); // Добавляем loading в зависимости для игнорирования первого запуска


    // =========================================================
    // 🔑 ФУНКЦИИ АУТЕНТИФИКАЦИИ
    // =========================================================

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
        setCurrentUser(null);
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