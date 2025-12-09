import { useState, useEffect } from 'react';
import { ProjectInfoDto, NewProjectData, TaskResponse, NewTaskData } from '../types';
import {
    canSetParent,
    getAvailableParents,
    areAllChildrenCompleted,
    flattenTasks,
    findTaskById,
    getRootTasks
} from '../utils/taskTreeUtils';
import { getAllProjects, getProjectInfo, apiCreateProject, apiCreateTask, updateProject as apiUpdateProject } from "../Components/Api/mainApi.ts";

export const useProjects = () => {
    const [projects, setProjects] = useState<ProjectInfoDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllProjects();

                const projectsWithDetails = await Promise.all(
                    data.map(async (project) => {
                        try {
                            return await getProjectInfo(project.id);
                        } catch (err) {
                            console.error(`Failed to fetch project ${project.id}:`, err);
                            return {
                                id: project.id,
                                title: project.title,
                                description: project.description,
                                tasks: [],
                                team: {
                                    id: '',
                                    teamName: '',
                                    users: []
                                }
                            } as ProjectInfoDto;
                        }
                    })
                );

                setProjects(projectsWithDetails);

            } catch (err: any) {
                console.error("Failed to fetch projects:", err);
                setError(err.message || "Не удалось загрузить проекты.");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const refreshProject = async (projectId: string) => {
        try {
            const updatedProject = await getProjectInfo(projectId);
            setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
        } catch (err) {
            console.error(`Failed to refresh project ${projectId}:`, err);
        }
    };

    const createProject = async (projectData: NewProjectData) => {
        try {
            await apiCreateProject(projectData.title, projectData.description);

            const data = await getAllProjects();
            const projectsWithDetails = await Promise.all(
                data.map(async (project) => {
                    try {
                        return await getProjectInfo(project.id);
                    } catch (err) {
                        console.error(`Failed to fetch project ${project.id}:`, err);
                        return {
                            id: project.id,
                            title: project.title,
                            description: project.description,
                            tasks: [],
                            team: {
                                id: '',
                                teamName: '',
                                users: []
                            }
                        } as ProjectInfoDto;
                    }
                })
            );
            setProjects(projectsWithDetails);
        } catch (err) {
            console.error("Failed to create project:", err);
            throw err;
        }
    };


    const updateProject = async (projectId: string, updates: Partial<ProjectInfoDto>) => {
        try {
            await apiUpdateProject(projectId, updates);
            // Update local state or refresh project
            await refreshProject(projectId);
        } catch (err) {
            console.error(`Failed to update project ${projectId}:`, err);
            throw err;
        }
    };

    const addTaskToProject = async (projectId: string, taskData: NewTaskData) => {
        try {
            const taskCreateDto = {
                Title: taskData.title,
                Description: '',
                Deadline: taskData.deadline,
                HeadTaskId: taskData.taskHeadId,
                UserId: taskData.assigneeId
            };

            await apiCreateTask(projectId, taskCreateDto);

            await refreshProject(projectId);
        } catch (err) {
            console.error("Failed to create task:", err);
            throw err;
        }
    };

    const updateTaskInProject = (projectId: string, taskId: string, updates: Partial<TaskResponse>) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const updateTaskRecursive = (tasks: TaskResponse[]): TaskResponse[] => {
                    return tasks.map(task => {
                        if (task.id === taskId) {
                            return { ...task, ...updates };
                        }
                        if (task.children && task.children.length > 0) {
                            return { ...task, children: updateTaskRecursive(task.children) };
                        }
                        return task;
                    });
                };

                return { ...project, tasks: updateTaskRecursive(project.tasks) };
            }
            return project;
        }));
    };

    const deleteTaskFromProject = async (projectId: string, taskId: string, removeChildren: boolean = false) => {
        try {
            await deleteTask(projectId, taskId);
            const updatedProject = await getProjectInfo(projectId);

            setProjects(prev => prev.map(p =>
                p.id === projectId ? updatedProject : p
            ));

            return updatedProject;

        } catch (err) {
            console.error("Failed to delete task from API:", err);
            throw err;
        }
    };


    const toggleTaskCompletion = (projectId: string, taskId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const flatTasks = flattenTasks(project.tasks);
        const task = flatTasks.find(t => t.id === taskId);
        if (!task) return;

        if (!areAllChildrenCompleted(taskId, flatTasks)) {
            alert('Нельзя отметить задачу как выполненную, пока не выполнены все подзадачи');
            return;
        }

        updateTaskInProject(projectId, taskId, {
            progress: task.progress === 'Done' ? 'Created' : 'Done'
        } as any);
    };

    const getAvailableParentsForTask = (projectId: string, taskId: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return [];

        const flatTasks = flattenTasks(project.tasks);
        return getAvailableParents(taskId, flatTasks);
    };

    const canSetTaskParent = (projectId: string, taskId: string, newParentId: string | null) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return false;

        const flatTasks = flattenTasks(project.tasks);
        return canSetParent(taskId, newParentId, flatTasks);
    };

    return {
        projects,
        setProjects,
        loading,
        error,
        createProject,
        updateProject,
        addTaskToProject,
        updateTaskInProject,
        deleteTaskFromProject,
        toggleTaskCompletion,
        getAvailableParentsForTask,
        canSetTaskParent,
        refreshProject
    };
};