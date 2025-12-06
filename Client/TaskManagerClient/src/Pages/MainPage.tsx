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

const MainPage = () => {
    const {
        projects,
        loading: projectsLoading,
        createProject,
        deleteProject,
        addTaskToProject,
        updateTaskInProject,
        deleteTaskFromProject,
        toggleTaskCompletion,
        getAvailableParentsForTask,
        canSetTaskParent
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

    // Check authentication after loading
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            setShowLogin(true);
        }

        if (isAuthenticated) {
            setShowLogin(false);
        }
    }, [authLoading, isAuthenticated]);

    // Sync selected project and task
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
            // TODO: Implement API call for adding participant
            setShowAddParticipant(false);
        }
    };

    const handleRemoveParticipant = (participantName: string) => {
        if (selectedProject) {
            // TODO: Implement API call for removing participant
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

    const handleDeleteTask = (taskId: string, removeChildren: boolean) => {
        if (selectedProject) {
            deleteTaskFromProject(selectedProject.id, taskId, removeChildren);
            setEditingTask(null);
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

    const handleDeleteProject = (projectId: string) => {
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
            return flattenTasks(selectedProject.tasks);
        }
    };

    const isRootTask = (task: TaskResponse | null) => {
        return task?.taskHeadId === null;
    };

    // Check if current user is project creator
    const isProjectCreator = selectedProject && currentUser &&
        selectedProject.team.users.some(u => u.id === currentUser.username && u.role === 'Creator');

    // Show loading screen
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