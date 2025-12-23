import axios from "axios";

const authApi = axios.create({
    baseURL: 'http://213.171.24.172:15378/api/Auth',
})


interface UserResponse {
    username: string,
    email: string,
    firstName: string,
    lastName: string,
}

interface LoginResponse {
    accessToken: string,
    refreshToken: string,
    user: UserResponse,
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export const apiLogin = async (email: string, password: string): Promise<LoginResponse> => {
    try {
        const response = await authApi.post<LoginResponse>("/login", {email, password})
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;

            switch (status) {
                case 400:
                    throw new Error("Validation failed.");
                case 401:
                    throw new Error("Authentication failed.");
                default:
                    throw new Error(`Произошла сетевая ошибка. Статус: ${status}`);
            }
        }
        throw error;
    }
}

export const apiRegister = async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
        const response = await authApi.post<LoginResponse>("/register", data)
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const status = error.response.status;

            switch (status) {
                case 400:
                    const detail400 = Object.values(error.response.data.errors)[0]?.[0] || "Validation failed.";
                    throw new Error(detail400);
                case 409:
                    throw new Error("Пользователь с такой почтой или именем уже зарегистрирован.");
                default:
                    throw new Error(`Произошла сетевая ошибка. Статус: ${status}`);
            }
        }
        throw error;
    }
}