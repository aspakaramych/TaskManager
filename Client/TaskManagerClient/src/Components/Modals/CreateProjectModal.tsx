import { User, NewProjectData } from '../../types';

interface CreateProjectModalProps {
  newProject: NewProjectData;
  allUsers: User[];
  currentUser: User | null;
  onNewProjectChange: (data: NewProjectData) => void;
  onToggleParticipant: (userName: string) => void;
  onCreateProject: () => void;
  onCancel: () => void;
}

export const CreateProjectModal = ({
  newProject,
  allUsers,
  currentUser,
  onNewProjectChange,
  onToggleParticipant,
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
          value={newProject.name}
          onChange={(e) => onNewProjectChange({ ...newProject, name: e.target.value })}
          placeholder="Введите название проекта"
        />
      </div>
      <div className="form-group">
        <label>Участники проекта:</label>
        <div className="participants-selection">
          {allUsers
            .filter(user => user.name !== currentUser?.name)
            .map(user => (
              <div key={user.id} className="participant-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newProject.participants.includes(user.name)}
                    onChange={() => onToggleParticipant(user.name)}
                  />
                  {user.name}
                </label>
              </div>
            ))
          }
        </div>
        <div className="current-user-note">
          <strong>{currentUser?.name}</strong> (вы) будете создателем проекта
        </div>
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