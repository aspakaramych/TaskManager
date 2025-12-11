import {ProjectUpdateDto} from "../Api/mainApi.ts";

interface UpdateProjectModalProps {
    newProject: ProjectUpdateDto;
    onNewProjectChange: (data: ProjectUpdateDto) => void;
    onUpdateProject: () => void;
    onCancel: () => void;
}

export const UpdateProjectModal = ({
                                       newProject,
                                       onNewProjectChange,
                                       onUpdateProject,
                                       onCancel
                                   }: UpdateProjectModalProps) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>Обновление проекта</h2>
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
                <label>Описание проекта:</label>
                <textarea
                    value={newProject.description}
                    onChange={(e) => onNewProjectChange({...newProject, description: e.target.value})}
                    placeholder="Введите описание проекта"
                    rows={3}
                />
            </div>
            <div className="modal-actions">
                <button className="confirm-btn" onClick={onUpdateProject}>
                    Обновить проект
                </button>
                <button className="cancel-btn" onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </div>
    </div>
);