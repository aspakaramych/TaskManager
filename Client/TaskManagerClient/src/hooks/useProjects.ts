import { useState, useEffect } from 'react';
import { Project, NewProjectData, Task, NewTaskData } from '../types';
import {
    canSetParent,
    getAvailableParents,
    areAllChildrenCompleted,
    updateParentCompletion,
    removeTaskAndProcessChildren,
    addChildToParent,
    removeChildFromParent
} from '../utils/taskTreeUtils';
import { getAllProjects } from "../Components/Api/mainApi.ts";

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getAllProjects();

                // Адаптируем данные из API к нашему интерфейсу Project
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const adaptedProjects: Project[] = data.map((apiProject: any) => ({
                    id: Number(apiProject.id) || Date.now(), // Преобразуем строку в число
                    title: apiProject.title || '',
                    description: apiProject.description || '',
                    participants: apiProject.participants || [],
                    tasks: apiProject.tasks || [],
                    creator: apiProject.creator || ''
                }));

                setProjects(adaptedProjects);
            } catch (err) {
                console.error("Failed to fetch projects:", err);
                setError(err instanceof Error ? err.message : "Не удалось загрузить проекты.");
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects]);

    const createProject = (projectData: NewProjectData, creator: string): Project => {
        const initialTask: Task = {
            id: Date.now(),
            title: projectData.title,
            description: 'Корневая задача проекта',
            dueDate: '',
            assignee: '',
            isCompleted: false,
            parentId: 'root',
            childrenIds: []
        };

        const project: Project = {
            id: Date.now(),
            title: projectData.title,
            description: projectData.description,
            participants: [creator, ...projectData.participants],
            tasks: [initialTask],
            creator
        };

        setProjects(prev => [...prev, project]);
        return project;
    };

    const deleteProject = (projectId: number) => {
        setProjects(prev => prev.filter(project => project.id !== projectId));
    };

    const updateProject = (projectId: number, updates: Partial<Project>) => {
        setProjects(prev => prev.map(project =>
            project.id === projectId ? { ...project, ...updates } : project
        ));
    };

    const addTaskToProject = (projectId: number, taskData: NewTaskData) => {
        const task: Task = {
            id: Date.now(),
            ...taskData,
            description: 'Описание задачи',
            isCompleted: false,
            childrenIds: []
        };

        const parentId = taskData.parentId === 'root' ? 'root' : taskData.parentId;

        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const updatedTasks = [...project.tasks, task];

                if (parentId && parentId !== 'root') {
                    const parentTask = updatedTasks.find(t => t.id.toString() === parentId.toString());
                    if (parentTask && !parentTask.childrenIds.includes(task.id)) {
                        parentTask.childrenIds.push(task.id);
                    }
                }

                return { ...project, tasks: updatedTasks };
            }
            return project;
        }));
    };

    const updateTaskInProject = (projectId: number, taskId: number, updates: Partial<Task>) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const updatedTasks = project.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                );

                return { ...project, tasks: updateParentCompletion(taskId, updatedTasks) };
            }
            return project;
        }));
    };

    const updateTaskWithParentChange = (
        projectId: number,
        taskId: number,
        updates: Partial<Task>,
        oldParentId: number | 'root' | null,
        newParentId: number | 'root' | null
    ) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                let updatedTasks = project.tasks.map(task =>
                    task.id === taskId ? { ...task, ...updates } : task
                );

                if (oldParentId && oldParentId !== 'root') {
                    updatedTasks = removeChildFromParent(taskId, Number(oldParentId), updatedTasks);
                }

                if (newParentId && newParentId !== 'root') {
                    updatedTasks = addChildToParent(taskId, Number(newParentId), updatedTasks);
                }

                if (oldParentId && oldParentId !== 'root') {
                    updatedTasks = updateParentCompletion(Number(oldParentId), updatedTasks);
                }

                if (newParentId && newParentId !== 'root') {
                    updatedTasks = updateParentCompletion(Number(newParentId), updatedTasks);
                }

                updatedTasks = updateParentCompletion(taskId, updatedTasks);

                return { ...project, tasks: updatedTasks };
            }
            return project;
        }));
    };

    const deleteTaskFromProject = (projectId: number, taskId: number, removeChildren: boolean = false) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const taskToDelete = project.tasks.find(t => t.id === taskId);
                if (!taskToDelete) return project;

                if (taskToDelete.parentId === 'root') {
                    alert('Корневую задачу проекта нельзя удалить');
                    return project;
                }

                let updatedTasks = removeTaskAndProcessChildren(taskId, project.tasks, removeChildren);

                if (typeof taskToDelete.parentId === 'number') {
                    updatedTasks = updateParentCompletion(taskToDelete.parentId, updatedTasks);
                }

                return { ...project, tasks: updatedTasks };
            }
            return project;
        }));
    };

    const toggleTaskCompletion = (projectId: number, taskId: number) => {
        setProjects(prev => prev.map(project => {
            if (project.id === projectId) {
                const task = project.tasks.find(t => t.id === taskId);
                if (!task) return project;

                if (!task.isCompleted && !areAllChildrenCompleted(taskId, project.tasks)) {
                    alert('Нельзя отметить задачу как выполненную, пока не выполнены все подзадачи');
                    return project;
                }

                const updatedTasks = project.tasks.map(t =>
                    t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
                );

                const finalTasks = updateParentCompletion(taskId, updatedTasks);

                return { ...project, tasks: finalTasks };
            }
            return project;
        }));
    };

    const addParticipantToProject = (projectId: number, participantName: string) => {
        setProjects(prev => prev.map(project =>
            project.id === projectId
                ? { ...project, participants: [...project.participants, participantName] }
                : project
        ));
    };

    const removeParticipantFromProject = (projectId: number, participantName: string) => {
        setProjects(prev => prev.map(project =>
            project.id === projectId
                ? {
                    ...project,
                    participants: project.participants.filter(p => p !== participantName)
                }
                : project
        ));
    };

    const getAvailableParentsForTask = (projectId: number, taskId: number) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return [];

        return getAvailableParents(taskId, project.tasks);
    };

    const canSetTaskParent = (projectId: number, taskId: number, newParentId: number | 'root' | null) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return false;

        return canSetParent(taskId, newParentId, project.tasks);
    };

    return {
        projects,
        loading,  // Теперь используется
        error,    // Теперь используется
        createProject,
        deleteProject,
        updateProject,
        addTaskToProject,
        updateTaskInProject,
        updateTaskWithParentChange,
        deleteTaskFromProject,
        toggleTaskCompletion,
        addParticipantToProject,
        removeParticipantFromProject,
        getAvailableParentsForTask,
        canSetTaskParent
    };
};