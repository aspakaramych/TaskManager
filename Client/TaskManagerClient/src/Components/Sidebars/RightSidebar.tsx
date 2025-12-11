import { useState, useEffect } from 'react';
import { ProjectInfoDto, User } from '../../types';
import { AddUserToProjectModal } from '../Modals/AddUserToProjectModal';
import { UpdateProjectModal } from "../Modals/UpdateProjectModal.tsx";
import { ProjectUpdateDto } from '../Api/mainApi';

interface RightSidebarProps {
    selectedProject: ProjectInfoDto | null;
    showAddParticipant: boolean;
    showUpdateProject: boolean;
    onAddParticipant: (userName: string) => void;
    onShowAddParticipant: (show: boolean) => void;
    onRemoveParticipant: (participantName: string) => void;
    isProjectCreator: boolean;
    onShowUpdateProject: (show: boolean) => void;
    onDeleteProject: (projectId: string) => void;
    currentUser: User | null;
    onRefreshProject?: () => void;
    onUpdateProject: (projectId: string, data: ProjectUpdateDto) => Promise<void>;
}

export const RightSidebar = ({
    selectedProject,
    showAddParticipant,
    showUpdateProject,
    onAddParticipant,
    onShowAddParticipant,
    onRemoveParticipant,
    isProjectCreator,
    onShowUpdateProject,
    onDeleteProject,
    currentUser,
    onRefreshProject,
    onUpdateProject
}: RightSidebarProps) => {

    const [updateData, setUpdateData] = useState<ProjectUpdateDto>({ title: '', description: '' });

    useEffect(() => {
        if (selectedProject) {
            setUpdateData({
                title: selectedProject.title,
                description: selectedProject.description
            });
        }
    }, [selectedProject, showUpdateProject]);

    const handleUpdate = async () => {
        if (selectedProject) {
            await onUpdateProject(selectedProject.id, updateData);
            onShowUpdateProject(false);
        }
    };

    return (
        <div className="right-sidebar">
            <h3>Участники</h3>
            {selectedProject ? (
                <div className="participants-section">
                    <button
                        className="add-participant-btn"
                        onClick={() => onShowAddParticipant(true)}
                    >
                        Добавить участника
                    </button>
                    <button
                        className="delete-project-btn"
                        onClick={() => onDeleteProject(selectedProject.id)}
                    >
                        Удалить проект
                    </button>
                    <button
                        className="update-project-btn"
                        onClick={() => onShowUpdateProject(true)}
                    >
                        Обновить проект
                    </button>
                    {showUpdateProject && (
                        <UpdateProjectModal
                            newProject={updateData}
                            onNewProjectChange={setUpdateData}
                            onUpdateProject={handleUpdate}
                            onCancel={() => {
                                onShowUpdateProject(false);
                            }} />
                    )}
                    {showAddParticipant && (
                        <AddUserToProjectModal
                            projectId={selectedProject.id}
                            teamId={selectedProject.team.id}
                            onClose={() => onShowAddParticipant(false)}
                            onUserAdded={() => {
                                onShowAddParticipant(false);
                                if (onRefreshProject) {
                                    onRefreshProject();
                                }
                            }}
                        />
                    )}
                    <div className="participants-list">
                        {selectedProject.team.users.map((user) => (
                            <div key={user.id} className="participant-item">
                                <span className={user.role === 'Creator' ? 'creator' : ''}>
                                    {user.username}
                                    {user.role === 'Creator' && ' (Создатель)'}
                                    {user.role && user.role !== 'Creator' && ` (${user.role})`}
                                </span>
                                {isProjectCreator && user.role !== 'Creator' && (
                                    <button
                                        className="remove-participant-btn"
                                        onClick={() => onRemoveParticipant(user.username)}
                                        title="Удалить участника"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-participants">Выберите проект</div>
            )}
        </div>
    );
};