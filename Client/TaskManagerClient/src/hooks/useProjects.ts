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
import {getAllTasks} from "../Components/Api/mainApi.ts";

export const useProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
    const [error, setError] = useState<string | null>(null); // Добавляем состояние ошибки

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Вызов асинхронной функции API
                const data = await getAllTasks();

                // 2. Установка полученных данных
                // Можно использовать requestAnimationFrame, хотя для API часто это не требуется,
                // так как обновление состояния уже асинхронно
                setProjects(data);

            } catch (err: any) {
                console.error("Failed to fetch projects:", err);
                // 3. Обработка ошибки
                setError(err.message || "Не удалось загрузить проекты.");
                setProjects([]); // Очищаем проекты при ошибке
            } finally {
                // 4. Завершение загрузки
                setLoading(false);
            }
        };

        fetchProjects();
        // Зависимости отсутствуют, вызывается один раз при монтировании компонента
    }, []);

    useEffect(() => {
        if (projects.length > 0) {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects]);

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const updateProjectTasks = (projectId: number, updatedTasks: Task[]): Project[] => {
        return projects.map(project => {
            if (project.id === projectId) {
                let finalTasks = [...updatedTasks];

                const changedTasks = updatedTasks.filter(newTask => {
                    const oldTask = project.tasks.find(t => t.id === newTask.id);
                    return oldTask && oldTask.isCompleted !== newTask.isCompleted;
                });

                changedTasks.forEach(changedTask => {
                    finalTasks = updateParentCompletion(changedTask.id, finalTasks);
                });

                return { ...project, tasks: finalTasks };
            }
            return project;
        });
    };

    const createProject = (projectData: NewProjectData, creator: string): Project => {
        const initialTask: Task = {
            id: Date.now(),
            title: projectData.name,
            description: 'Корневая задача проекта',
            dueDate: '',
            assignee: '',
            isCompleted: false,
            parentId: 'root',
            childrenIds: []
        };

        const project: Project = {
            id: Date.now(),
            name: projectData.name,
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