
import React, { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../Components/Header/Header';
import { CreateProjectModal } from '../Components/Modals/CreateProjectModal';
import { LeftSidebar } from '../Components/Sidebars/LeftSidebar';
import { RightSidebar } from '../Components/Sidebars/RightSidebar';
import { CenterArea } from '../Components/CenterArea/CenterArea';
import type { NewProjectData, NewTaskData, TaskResponse, ProjectInfoDto, User } from '../types';
import './MainPage.css';
import { flattenTasks } from '../utils/taskTreeUtils';
import { deleteProject, getAllProjects, deleteTask, getProjectInfo, updateTask } from '../Components/Api/mainApi';

const MainPage = () => {
    const {
        projects,
        setProjects,
        loading: projectsLoading,
        createProject,
        addTaskToProject,
        updateTaskInProject,
        deleteTaskFromProject,
        toggleTaskCompletion,
        getAvailableParentsForTask,
        canSetTaskParent,
        refreshProject,
        updateProject
    } = useProjects();

    const {
        currentUser,
        logout,
        loading: authLoading,
        isAuthenticated,
    } = useAuth();

    const [selectedProject, setSelectedProject] = useState<ProjectInfoDto | null>(null);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProject, setNewProject] = useState<NewProjectData>({ title: '', description: '' });
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
    const [newTask, setNewTask] = useState<NewTaskData>({
        title: '',
        deadline: new Date(),
        assigneeId: null,
        taskHeadId: null
    });
    const [showLogin, setShowLogin] = useState(false);
    const [showUpdateProject, setShowUpdateProject] = useState(false);
    const [updatingTask, setUpdatingTask] = useState<TaskResponse | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShowLogin(true);
        }

        if (isAuthenticated) {
            setShowLogin(false);
        }
    }, [authLoading, isAuthenticated]);

    useEffect(() => {
        if (selectedProject) {
            const updatedProject = projects.find(p => p.id === selectedProject.id);
            if (updatedProject && updatedProject !== selectedProject) {
                requestAnimationFrame(() => {
                    setSelectedProject(updatedProject);

                    if (editingTask) {
                        const flatTasks = flattenTasks(updatedProject.tasks);
                        const updatedTask = flatTasks.find(t => t.id === editingTask.id);
                        if (updatedTask && updatedTask !== editingTask) {
                            setEditingTask(updatedTask);
                        }
                    }
                });
            }
        }
    }, [projects, selectedProject, editingTask]);

    const handleCreateProject = async () => {
        if (newProject.title.trim() && currentUser) {
            try {
                await createProject(newProject);
                setNewProject({ title: '', description: '' });
                setShowCreateProject(false);
            } catch (err) {
                console.error('Failed to create project:', err);
                alert('Не удалось создать проект');
            }
        }
    };

    const handleAddParticipant = (userName: string) => {
        if (selectedProject) {
            setShowAddParticipant(false);
        }
    };

    const handleRemoveParticipant = (participantName: string) => {
        if (selectedProject) {
        }
    };

    const handleCreateTask = async () => {
        if (newTask.title.trim() && selectedProject) {
            try {
                await addTaskToProject(selectedProject.id, newTask);
                setNewTask({
                    title: '',
                    deadline: new Date(),
                    assigneeId: null,
                    taskHeadId: null
                });
                setShowCreateTask(false);
            } catch (err) {
                console.error('Failed to create task:', err);
                alert('Не удалось создать задачу');
            }
        }
    };

    const handleUpdateTask = () => {
        if (editingTask && selectedProject) {
            updateTaskInProject(selectedProject.id, editingTask.id, editingTask);
            setEditingTask(null);
        }
    };

    const handleTaskUpdate = async (updatedTask: TaskResponse) => {
        if (selectedProject) {
            try {
                let deadlineValue = null;
                if (updatedTask.deadline) {
                    const date = updatedTask.deadline instanceof Date ?
                        updatedTask.deadline :
                        new Date(updatedTask.deadline);

                    if (!isNaN(date.getTime())) {
                        deadlineValue = date.toISOString();
                    }
                }

                const taskUpdateDto = {
                    title: updatedTask.title,
                    description: updatedTask.description || null,
                    deadline: deadlineValue,
                    progress: updatedTask.progress,
                };

                console.log('===== ПЕРЕД ОБНОВЛЕНИЕМ =====');
                console.log('ID обновляемой задачи:', updatedTask.id);
                console.log('ID проекта:', selectedProject.id);

                // Логируем текущие задачи до обновления
                console.log('Текущие задачи в проекте ДО обновления:');
                const logTasks = (tasks: TaskResponse[], level = 0) => {
                    tasks.forEach(task => {
                        const indent = '  '.repeat(level);
                        console.log(`${indent}${task.id}: ${task.title} [${task.progress}]`);
                        console.log(`${indent}  assigneeId: ${task.assigneeId}`);
                        console.log(`${indent}  deadline: ${task.deadline}`);
                        console.log(`${indent}  taskHeadId: ${task.taskHeadId}`);
                        if (task.children && task.children.length > 0) {
                            logTasks(task.children, level + 1);
                        }
                    });
                };
                logTasks(selectedProject.tasks);
                console.log('=============================');

                console.log('Отправляю на сервер:', taskUpdateDto);

                await updateTask(taskUpdateDto, selectedProject.id, updatedTask.id);

                alert('✅ Задача обновлена!');
                setUpdatingTask(null);
                setEditingTask(null);

                // ОБНОВЛЯЕМ ПРОЕКТ ПРАВИЛЬНО:
                // 1. Обновляем в useProjects
                console.log('Вызываю refreshProject...');
                await refreshProject(selectedProject.id);

                // 2. Получаем свежий проект для selectedProject
                console.log('Получаю свежий проект через getProjectInfo...');
                const freshProject = await getProjectInfo(selectedProject.id);

                console.log('===== ПОСЛЕ ОБНОВЛЕНИЯ =====');
                console.log('Получен обновленный проект:');
                console.log('Project ID:', freshProject.id);
                console.log('Количество задач:', freshProject.tasks?.length || 0);

                // Логируем обновленные задачи
                console.log('Обновленные задачи в проекте:');
                const logFreshTasks = (tasks: TaskResponse[], level = 0) => {
                    tasks.forEach(task => {
                        const indent = '  '.repeat(level);
                        console.log(`${indent}${task.id}: ${task.title} [${task.progress}]`);
                        console.log(`${indent}  assigneeId: ${task.assigneeId}`);
                        console.log(`${indent}  deadline: ${task.deadline}`);
                        console.log(`${indent}  taskHeadId: ${task.taskHeadId}`);

                        // Проверяем, это обновляемая задача?
                        if (task.id === updatedTask.id) {
                            console.log(`${indent}  <<< ЭТО ОБНОВЛЕННАЯ ЗАДАЧА >>>`);
                            console.log(`${indent}  Старое значение progress: ${updatedTask.progress}`);
                            console.log(`${indent}  Новое значение progress: ${task.progress}`);
                        }

                        if (task.children && task.children.length > 0) {
                            logFreshTasks(task.children, level + 1);
                        }
                    });
                };
                logFreshTasks(freshProject.tasks);
                console.log('=============================');

                // 3. Обновляем состояние
                console.log('Устанавливаю setSelectedProject...');
                setSelectedProject(freshProject);

                // 4. Проверяем обновление в localStorage или session
                console.log('===== ПРОВЕРКА СОСТОЯНИЯ =====');
                setTimeout(() => {
                    console.log('Через 500ms проверяем selectedProject:');
                    console.log('selectedProject в состоянии:', selectedProject?.id);
                }, 500);

            } catch (err: any) {
                console.error('Ошибка:', err);
                console.error('Stack:', err.stack);
                alert('❌ Не удалось обновить: ' + err.message);
            }
        }
    };

    const handleDeleteTask = async (taskId: string, removeChildren: boolean) => {
        if (selectedProject) {
            if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
                return;
            }

            try {
                await deleteTask(selectedProject.id, taskId);

                setEditingTask(null);

                const updatedProject = await getProjectInfo(selectedProject.id);

                setSelectedProject(updatedProject);

            } catch (err) {
                console.error('Failed to delete task:', err);
                alert('Не удалось удалить задачу');
            }
        }
    };

    const handleToggleTaskCompletion = (taskId: string) => {
        if (selectedProject) {
            toggleTaskCompletion(selectedProject.id, taskId);

            if (editingTask && editingTask.id === taskId) {
                const updatedProject = projects.find(p => p.id === selectedProject.id);
                if (updatedProject) {
                    const flatTasks = flattenTasks(updatedProject.tasks);
                    const updatedTask = flatTasks.find(t => t.id === taskId);
                    if (updatedTask) {
                        setEditingTask(updatedTask);
                    }
                }
            }
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот проект? Все задачи будут удалены.')) {
            try {
                await deleteProject(projectId);

                if (selectedProject && selectedProject.id === projectId) {
                    setSelectedProject(null);
                    setEditingTask(null);
                }

                window.location.reload();

            } catch (error) {
                console.error('Failed to delete project:', error);
                alert('Не удалось удалить проект');
            }
        }
    };

    const handleLogout = () => {
        logout();
        setSelectedProject(null);
        setEditingTask(null);
    };

    const getAvailableParents = () => {
        if (!selectedProject) return [];

        if (editingTask) {
            return getAvailableParentsForTask(selectedProject.id, editingTask.id);
        } else {
            return flattenTasks(selectedProject.tasks);
        }
    };

    const isRootTask = (task: TaskResponse | null) => {
        return task?.taskHeadId === null;
    };

    const isProjectCreator = selectedProject && currentUser &&
        selectedProject.team.users.some(u => u.id === currentUser.username && u.role === 'Creator');


    if (authLoading || projectsLoading) {
        return (
            <div className="main-page loading-screen">
                <div className="loading-spinner">Загрузка данных...</div>
            </div>
        );
    }

    return (
        <div className="main-page">
            <Header
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <div className="block-container">
                <div className="main-layout">
                    <LeftSidebar
                        projects={projects}
                        selectedProject={selectedProject}
                        onProjectSelect={(project: ProjectInfoDto) => {
                            setSelectedProject(project);
                            setEditingTask(null);
                            setShowCreateTask(false);
                        }}
                        onBack={() => {
                            setSelectedProject(null);
                            setEditingTask(null);
                            setShowCreateTask(false);
                        }}
                        onShowCreateProject={() => setShowCreateProject(true)}
                        onTaskClick={setEditingTask}
                        onCreateTask={() => {
                            setEditingTask(null);
                            setShowCreateTask(true);
                        }}
                        isProjectCreator={isProjectCreator}
                        currentUser={currentUser}
                    />
                    <CenterArea
                        selectedProject={selectedProject}
                        showCreateTask={showCreateTask}
                        newTask={newTask}
                        onNewTaskChange={setNewTask}
                        onCreateTask={handleCreateTask}
                        onCancelCreateTask={() => setShowCreateTask(false)}
                        editingTask={editingTask}
                        onEditingTaskChange={setEditingTask}
                        onUpdateTask={handleUpdateTask}
                        onDeleteTask={handleDeleteTask}
                        onCancelEditTask={() => setEditingTask(null)}
                        onToggleTaskCompletion={handleToggleTaskCompletion}
                        onTaskAssigned={() => selectedProject && refreshProject(selectedProject.id)}
                        isProjectCreator={isProjectCreator}
                        currentUser={currentUser}
                        availableParents={getAvailableParents()}
                        isRootTask={isRootTask}
                        updatingTask={updatingTask}
                        onUpdatingTaskChange={setUpdatingTask}
                        onTaskUpdate={handleTaskUpdate}
                    />
                    <RightSidebar
                        selectedProject={selectedProject}
                        showAddParticipant={showAddParticipant}
                        onAddParticipant={handleAddParticipant}
                        onShowUpdateProject={setShowUpdateProject}
                        showUpdateProject={showUpdateProject}
                        onUpdateProject={updateProject}
                        onShowAddParticipant={setShowAddParticipant}
                        onRemoveParticipant={handleRemoveParticipant}
                        isProjectCreator={isProjectCreator}
                        onDeleteProject={handleDeleteProject}
                        currentUser={currentUser}
                        onRefreshProject={() => selectedProject && refreshProject(selectedProject.id)}
                    />
                </div>
            </div>

            {showCreateProject && (
                <CreateProjectModal
                    newProject={newProject}
                    currentUser={currentUser}
                    onNewProjectChange={setNewProject}
                    onCreateProject={handleCreateProject}
                    onCancel={() => setShowCreateProject(false)}
                />
            )}
        </div>
    );
};

export default MainPage;

