import axios from "axios";

const mainApi = axios.create({
    baseURL: 'http://auth:15378/api/Main',
    headers: {
        'Content-Type': 'application/json',
    },
});

mainApi.interceptors.request.use(
    (config) => {
        const authTokens = localStorage.getItem('authTokens');

        if (authTokens) {
            try {
                const parsedTokens = JSON.parse(authTokens);
                const accessToken = parsedTokens.accessToken;

                if (accessToken) {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            } catch (error) {
                console.error("Ошибка парсинга токенов из localStorage:", error);
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

export interface TaskResponse {
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

export enum TaskProgress {
    Done = 'Done',
    Canceled = 'Canceled',
    Taken = 'Taken',
    Created = 'Created',
}

export class TaskCreateDto {
    public Title: string = '';
    public Description: string | null = null;
    public Deadline: Date = new Date();
    public HeadTaskId: string | null;
    public UserId: string | null;
}

export interface TaskInfo {
    id: string;
    title: string;
    description: string;
    status: string;
    deadline: Date;
    taskHeadName?: string | null;
    users?: string[] | null;
}

export interface ProjectInfoDto {
    id: string;
    title: string;
    description: string;
    tasks: TaskResponse[];
    team: TeamResponse;
}

export interface TeamResponse {
    id: string;
    teamName: string;
    users: UserInTeamDto[];
}

export interface UserInTeamDto {
    id: string;
    username: string;
    role: string;
}

export interface AddUserToTeamDto {
    userId: string;
    teamId: string;
    role: string;
}

export enum RoleType {
    ProjectManager = "ProjectManager",
    Backend = "Backend",
    Frontend = "Frontend",
    Designer = "Designer",
    Mobile = "Mobile",
}

export interface UserResponse {
    id: string;
    username: string;
}

export interface TaskUpdateDto {
    title?: string | null;
    description?: string | null;
    deadline?: string | null; // ISO string
    progress?: TaskProgress | null;
}

export interface ProjectUpdateDto {
    title?: string;
    description?: string;
}

export const getAllProjects = async (): Promise<Project[]> => {
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

export const apiCreateProject = async (title: string, description: string): Promise<void> => {
    try {
        const response = await mainApi.post<void>("/projects", { title, description })

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

export const apiGetAllTasks = async (id: string): Promise<TaskResponse[]> => {
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
// test
export const apiCreateTask = async (id: string, task: TaskCreateDto): Promise<void> => {
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

export const getProjectInfo = async (id: string): Promise<ProjectInfoDto> => {
    try {
        const response = await mainApi.get<ProjectInfoDto>(`/project/${id}`)
        return response.data
    }
    catch (error) {
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

export const addUserToTeam = async (projectId: string, user: AddUserToTeamDto): Promise<void> => {
    try {
        const response = await mainApi.post<UserInTeamDto>(`project/${projectId}/team`, user)
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

export const getUsers = async (): Promise<UserResponse[]> => {
    try {
        const response = await mainApi.get<UserResponse[]>(`users`)
        return response.data
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

export const getTaskInfo = async (projectId: string, taskId: string): Promise<TaskInfo> => {
    try {
        const response = await mainApi.get<TaskInfo>(`project/${projectId}/task/${taskId}`)
        return response.data
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

export const assignTask = async (projectId: string, taskId: string): Promise<void> => {
    try {
        const response = await mainApi.get(`project/${projectId}/task/${taskId}/assign`)
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

export const rejectTask = async (projectId: string, taskId: string): Promise<void> => {
    try {
        const response = await mainApi.delete(`project/${projectId}/task/${taskId}/assign`)
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

export const updateTask = async (task: any, projectId: string, taskId: string): Promise<void> => {
    try {
        // ОБЯЗАТЕЛЬНО обернуть в taskUpdateDto
        const requestData = {
            taskUpdateDto: task
        };

        console.log('Отправляю на сервер:', requestData);

        const response = await mainApi.patch(`project/${projectId}/task/${taskId}`, requestData);

        console.log('Успех:', response.data);

    } catch (error: any) {
        console.error('Ошибка API:', error.response?.data);
        throw error;
    }
};

export const deleteTask = async (projectId: string, taskId: string): Promise<void> => {
    try {
        const response = await mainApi.delete(`project/${projectId}/task/${taskId}`)
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

export const updateProject = async (projectId: string, project: ProjectUpdateDto): Promise<void> => {
    try {
        const response = await mainApi.put(`project/${projectId}`, project)
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

export const deleteProject = async (projectId: string): Promise<void> => {
    try {
        const response = await mainApi.delete(`project/${projectId}`)
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