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
import { getAllProjects, getProjectInfo, apiCreateProject, apiCreateTask } from "../Components/Api/mainApi.ts";

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

                // Fetch full project info for each project
                const projectsWithDetails = await Promise.all(
                    data.map(async (project) => {
                        try {
                            return await getProjectInfo(project.id);
                        } catch (err) {
                            console.error(`Failed to fetch project ${project.id}:`, err);
                            // Return basic project info if detailed fetch fails
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

            // Refresh all projects to get the new one
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

    const deleteProject = (projectId: string) => {
        // TODO: Implement API call for deleting project
        setProjects(prev => prev.filter(project => project.id !== projectId));
    };

    const updateProject = (projectId: string, updates: Partial<ProjectInfoDto>) => {
        // TODO: Implement API call for updating project
        setProjects(prev => prev.map(project =>
            project.id === projectId ? { ...project, ...updates } : project
        ));
    };

    const addTaskToProject = async (projectId: string, taskData: NewTaskData) => {
        try {
            const taskCreateDto = {
                Title: taskData.title,
                Description: '',
                Deadline: taskData.deadline
            };

            await apiCreateTask(projectId, taskCreateDto);

            // Refresh project to get updated tasks
            await refreshProject(projectId);
        } catch (err) {
            console.error("Failed to create task:", err);
            throw err;
        }
    };

    const updateTaskInProject = (projectId: string, taskId: string, updates: Partial<TaskResponse>) => {
        // TODO: Implement API call for updating task
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

    const deleteTaskFromProject = (projectId: string, taskId: string, removeChildren: boolean = false) => {
        // TODO: Implement API call for deleting task
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const removeTaskRecursive = (tasks: TaskResponse[]): TaskResponse[] => {
                    return tasks.filter(task => {
                        if (task.id === taskId) {
                            return false;
                        }
                        if (task.children && task.children.length > 0) {
                            task.children = removeTaskRecursive(task.children);
                        }
                        return true;
                    });
                };

                return { ...project, tasks: removeTaskRecursive(project.tasks) };
            }
            return project;
        }));
    };

    const toggleTaskCompletion = (projectId: string, taskId: string) => {
        // TODO: Implement API call for toggling task completion
        const project = projects.find(p => p.id === projectId);
        if (!project) return;

        const flatTasks = flattenTasks(project.tasks);
        const task = flatTasks.find(t => t.id === taskId);
        if (!task) return;

        // Check if all children are completed before marking as done
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
        loading,
        error,
        createProject,
        deleteProject,
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