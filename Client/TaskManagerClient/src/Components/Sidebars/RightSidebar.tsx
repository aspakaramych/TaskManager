import { ProjectInfoDto, User } from '../../types';

interface RightSidebarProps {
  selectedProject: ProjectInfoDto | null;
  showAddParticipant: boolean;
  onAddParticipant: (userName: string) => void;
  onShowAddParticipant: (show: boolean) => void;
  onRemoveParticipant: (participantName: string) => void;
  isProjectCreator: boolean;
  onDeleteProject: (projectId: string) => void;
  currentUser: User | null;
}

export const RightSidebar = ({
  selectedProject,
  showAddParticipant,
  onAddParticipant,
  onShowAddParticipant,
  onRemoveParticipant,
  isProjectCreator,
  onDeleteProject,
  currentUser
}: RightSidebarProps) => (
  <div className="right-sidebar">
    <h3>Участники</h3>
    {selectedProject ? (
      <div className="participants-section">
        {isProjectCreator && (
          <>
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
          </>
        )}
        {showAddParticipant && (
          <div className="add-participant-modal">
            <h4>Добавить участника:</h4>
            <p>Функция добавления участников будет реализована позже</p>
            <button
              className="close-modal-btn"
              onClick={() => onShowAddParticipant(false)}
            >
              Закрыть
            </button>
          </div>
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