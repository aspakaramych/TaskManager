import { useState, useEffect } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../Components/Header/Header';
import { LoginModal } from '../Components/Modals/LoginModal';
import { CreateProjectModal } from '../Components/Modals/CreateProjectModal';
import { LeftSidebar } from '../Components/Sidebars/LeftSidebar';
import { RightSidebar } from '../Components/Sidebars/RightSidebar';
import { CenterArea } from '../Components/CenterArea/CenterArea';
import type { NewProjectData, NewTaskData, Task, Project, User } from '../types';
import './MainPage.css';

const MainPage = () => {
  const { 
    projects, 
    createProject, 
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
  const { currentUser, allUsers, login, logout } = useAuth();
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState<NewProjectData>({ name: '', participants: [] });
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

  const handleCreateProject = () => {
    if (newProject.name.trim() && currentUser) {
      const project = createProject(newProject, currentUser.name);
      setSelectedProject(project);
      setNewProject({ name: '', participants: [] });
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
  

  const toggleParticipant = (userName: string) => {
    setNewProject(prev => ({
      ...prev,
      participants: prev.participants.includes(userName)
        ? prev.participants.filter(p => p !== userName)
        : [...prev.participants, userName]
    }));
  };

  const handleLogin = (user: User) => {
    login(user);
    setShowLogin(false);
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

  const userProjects = projects.filter(project =>
    currentUser && project.participants.includes(currentUser.name)
  );

  const isProjectCreator = selectedProject && currentUser &&
    selectedProject.creator === currentUser.name;

  return (
    <div className="main-page">
      <Header 
        currentUser={currentUser} 
        onLogin={() => setShowLogin(true)}
        onLogout={handleLogout}
      />
      <div className="block-container">
        <div className="main-layout">
          <LeftSidebar
            projects={userProjects}
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
            allUsers={allUsers}
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
          allUsers={allUsers}
          currentUser={currentUser}
          onNewProjectChange={setNewProject}
          onToggleParticipant={toggleParticipant}
          onCreateProject={handleCreateProject}
          onCancel={() => setShowCreateProject(false)}
        />
      )}

      {showLogin && (
        <LoginModal
          users={allUsers}
          onLogin={handleLogin}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
};

export default MainPage;