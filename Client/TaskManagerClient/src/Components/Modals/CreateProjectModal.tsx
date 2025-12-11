import { NewProjectData, User } from '../../types';

interface CreateProjectModalProps {
    newProject: NewProjectData;
    currentUser: User | null;
    onNewProjectChange: (data: NewProjectData) => void;
    onCreateProject: () => void;
    onCancel: () => void;
}

export const CreateProjectModal = ({
                                       newProject,
                                       currentUser,
                                       onNewProjectChange,
                                       onCreateProject,
                                       onCancel
                                   }: CreateProjectModalProps) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>Создание нового проекта</h2>
            <div className="form-group">
                <label>Название проекта:</label>
                <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => onNewProjectChange({...newProject, title: e.target.value})}
                    placeholder="Введите название проекта"
                />
            </div>
            <div className="form-group">
                <label>Описание проекта:</label> {/* Исправил label */}
                <textarea
                    value={newProject.description}
                    onChange={(e) => onNewProjectChange({...newProject, description: e.target.value})}
                    placeholder="Введите описание проекта"
                    rows={3}
                />
            </div>
            <div className="current-user-note">
                <strong>{currentUser?.username}</strong> (вы) будете создателем проекта
            </div>
            <div className="modal-actions">
                <button className="confirm-btn" onClick={onCreateProject}>
                    Создать проект
                </button>
                <button className="cancel-btn" onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </div>
    </div>
);