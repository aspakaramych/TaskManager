import React, { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth'; // Используем новую версию с loading
import { Header } from '../Components/Header/Header';
import { CreateProjectModal } from '../Components/Modals/CreateProjectModal';
import { LeftSidebar } from '../Components/Sidebars/LeftSidebar';
import { RightSidebar } from '../Components/Sidebars/RightSidebar';
import { CenterArea } from '../Components/CenterArea/CenterArea';
import type { NewProjectData, NewTaskData, Task, Project, User } from '../types';
import './MainPage.css';
import {apiCreateProject} from "../Components/Api/mainApi.ts";

const MainPage = () => {
    const {
        projects,
        deleteProject,
        addTaskToProject,
        updateTaskInProject,
        updateTaskWithParentChange,
        deleteTaskFromProject,
        toggleTaskCompletion,
        addParticipantToProject,
        removeParticipantFromProject,
        getAvailableParentsForTask,
        canSetTaskParent
    } = useProjects();
    const {
        currentUser,
        logout,
        loading,
        isAuthenticated,
    } = useAuth();

    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showCreateProject, setShowCreateProject] = useState(false);
    const [newProject, setNewProject] = useState<NewProjectData>({ title: '', description: '' });
    const [showAddParticipant, setShowAddParticipant] = useState(false);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [newTask, setNewTask] = useState<NewTaskData>({
        title: '',
        dueDate: '',
        assignee: '',
        parentId: null
    });
    const [showLogin, setShowLogin] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);

    // 2. ✅ Эффект для проверки аутентификации после загрузки
    useEffect(() => {
        // Если загрузка завершена И пользователь не аутентифицирован, показываем модаль логина
        if (!loading && !isAuthenticated) {
            setShowLogin(true);
        }

        // Если пользователь аутентифицирован, скрываем модаль логина (если он был открыт)
        if (isAuthenticated) {
            setShowLogin(false);
        }

    }, [loading, isAuthenticated]);

    // Эффект для синхронизации выбранного проекта и задачи
    useEffect(() => {
        if (selectedProject) {
            const updatedProject = projects.find(p => p.id === selectedProject.id);
            if (updatedProject && updatedProject !== selectedProject) {
                requestAnimationFrame(() => {
                    setSelectedProject(updatedProject);

                    if (editingTask) {
                        const updatedTask = updatedProject.tasks.find(t => t.id === editingTask.id);
                        if (updatedTask && updatedTask !== editingTask) {
                            setEditingTask(updatedTask);
                        }
                    }
                });
            }
        }
    }, [projects, selectedProject, editingTask]);

    // ... (Остальные обработчики остаются без изменений)
    const handleCreateProject = async () => {
        if (newProject.title.trim() && currentUser) {
            await apiCreateProject(newProject.title, newProject.description);
            setNewProject({ title: '', description: '' });
            setShowCreateProject(false);
        }
    };

    const handleAddParticipant = (userName: string) => {
        if (selectedProject) {
            addParticipantToProject(selectedProject.id, userName);
            setShowAddParticipant(false);
        }
    };

    const handleRemoveParticipant = (participantName: string) => {
        if (selectedProject && participantName !== selectedProject.creator) {
            removeParticipantFromProject(selectedProject.id, participantName);
        }
    };

    const handleCreateTask = () => {
        if (newTask.title.trim() && selectedProject) {

            if (newTask.parentId && newTask.parentId !== 'root' &&
                !canSetTaskParent(selectedProject.id, -1, newTask.parentId)) {
                alert('Невозможно установить выбранного родителя (обнаружен цикл)');
                return;
            }

            addTaskToProject(selectedProject.id, newTask);
            setNewTask({ title: '', dueDate: '', assignee: '', parentId: null });
            setShowCreateTask(false);
        }
    };

    const handleUpdateTask = () => {
        if (editingTask && selectedProject) {
            const oldTask = selectedProject.tasks.find(t => t.id === editingTask.id);
            if (!oldTask) return;

            const oldParentId = oldTask.parentId;
            const newParentId = editingTask.parentId;


            if (editingTask.parentId && editingTask.parentId !== 'root' &&
                !canSetTaskParent(selectedProject.id, editingTask.id, editingTask.parentId)) {
                alert('Невозможно установить выбранного родителя (обнаружен цикл)');
                return;
            }

            if (oldParentId !== newParentId) {
                updateTaskWithParentChange(
                    selectedProject.id,
                    editingTask.id,
                    editingTask,
                    oldParentId,
                    newParentId
                );
            } else {
                updateTaskInProject(selectedProject.id, editingTask.id, editingTask);
            }

            setEditingTask(null);
        }
    };

    const handleDeleteTask = (taskId: number, removeChildren: boolean) => {
        if (selectedProject) {
            deleteTaskFromProject(selectedProject.id, taskId, removeChildren);
            setEditingTask(null);
        }
    };

    const handleToggleTaskCompletion = (taskId: number) => {
        if (selectedProject) {
            toggleTaskCompletion(selectedProject.id, taskId);

            if (editingTask && editingTask.id === taskId) {
                const updatedProject = projects.find(p => p.id === selectedProject.id);
                if (updatedProject) {
                    const updatedTask = updatedProject.tasks.find(t => t.id === taskId);
                    if (updatedTask) {
                        setEditingTask(updatedTask);
                    }
                }
            }
        }
    };

    const handleDeleteProject = (projectId: number) => {
        if (window.confirm('Вы уверены, что хотите удалить этот проект? Все задачи будут удалены.')) {
            deleteProject(projectId);
            if (selectedProject && selectedProject.id === projectId) {
                setSelectedProject(null);
                setEditingTask(null);
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
            return selectedProject.tasks;
        }
    };

    const isRootTask = (task: Task | null) => {
        return task?.parentId === 'root';
    };


    const isProjectCreator = selectedProject && currentUser &&
        selectedProject.creator === currentUser.username;

    // 3. ✅ Отображение состояния загрузки (до проверки аутентификации)
    if (loading) {
        return (
            <div className="main-page loading-screen">
                <div className="loading-spinner">Загрузка данных...</div>
            </div>
        );
    }

    // 4. ✅ Если пользователь не аутентифицирован и модаль не открыт,
    //    открываем модаль, но компонент продолжает рендерить, чтобы показать его.
    //    (Фактическое отображение модаля контролируется showLogin).


    return (
        <div className="main-page">
            <Header
                currentUser={currentUser}
                onLogout={handleLogout}
            />
            <div className="block-container">
                <div className="main-layout">
                    {/* Все остальные компоненты требуют currentUser, поэтому они будут работать
              корректно только если isAuthenticated=true, что скрывает LoginModal */}
                    <LeftSidebar
                        projects={projects}
                        selectedProject={selectedProject}
                        onProjectSelect={(project: Project) => {
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
                        isProjectCreator={isProjectCreator}
                        currentUser={currentUser}
                        availableParents={getAvailableParents()}
                        isRootTask={isRootTask(editingTask)}
                    />
                    <RightSidebar
                        selectedProject={selectedProject}
                        showAddParticipant={showAddParticipant}
                        onAddParticipant={handleAddParticipant}
                        onShowAddParticipant={setShowAddParticipant}
                        onRemoveParticipant={handleRemoveParticipant}
                        isProjectCreator={isProjectCreator}
                        onDeleteProject={handleDeleteProject}
                        currentUser={currentUser}
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