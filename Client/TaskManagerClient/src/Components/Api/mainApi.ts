import axios from "axios";

const mainApi = axios.create({
    baseURL: 'http://localhost:15378/api/Main', // Предположим, что это ваш основной URL
    headers: {
        'Content-Type': 'application/json',
    },
});

mainApi.interceptors.request.use(
    (config) => {
        // Читаем токены из localStorage
        const authTokens = localStorage.getItem('authTokens');

        if (authTokens) {
            try {
                const parsedTokens = JSON.parse(authTokens);
                const accessToken = parsedTokens.accessToken;

                if (accessToken) {
                    // 💡 КЛЮЧЕВОЙ ШАГ: Прикрепляем токен к заголовку Authorization
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            } catch (error) {
                console.error("Ошибка парсинга токенов из localStorage:", error);
                // Если парсинг не удался, не прикрепляем заголовок
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

interface Project {
    id: string;
    title: string;
    description: string;
    role: string;
    teamId: string;
}

interface TaskResponse {
    id: string;
    title: string;
    description: string;
    deadline: Date;
    progress: TaskProgress;
    projectId: string;
    taskHeadId: string | null;
    assigneeId: string | null;
    assigneeName: string | null;
    children: TaskResponse[];
}

enum TaskProgress {
    Done = 'Done',
    Canceled = 'Canceled',
    Taken = 'Taken',
    Created = 'Created',
}

export class TaskCreateDto {
    public Title: string = '';
    public Description: string | null = null;
    public Deadline: Date = new Date();
}

export const getAllProjects = async () : Promise<Project[]> => {
    try {
        const response = await mainApi.get<Project[]>("/")
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

export const apiCreateProject = async (title: string, description: string) : Promise<void> => {
    try {
        const response = await mainApi.post<void>("/projects", {title, description})

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

export const apiGetAllTasks = async (id: string) : Promise<TaskResponse[]> => {
    try {
        const response = await mainApi.get<TaskResponse[]>(`/project/${id}/tasks`)
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

export const apiCreateTask = async (id: string, task: TaskCreateDto) : Promise<void> => {
    try {
        const response = await mainApi.post<void>(`/project/${id}/tasks`, task)

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