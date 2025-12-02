import { Project, User } from '../../types';

interface RightSidebarProps {
  selectedProject: Project | null;
  showAddParticipant: boolean;
  allUsers: User[];
  onAddParticipant: (userName: string) => void;
  onShowAddParticipant: (show: boolean) => void;
  onRemoveParticipant: (participantName: string) => void;
  isProjectCreator: boolean;
  onDeleteProject: (projectId: number) => void;
  currentUser: User | null;
}

export const RightSidebar = ({
  selectedProject,
  showAddParticipant,
  allUsers,
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
            <h4>Выберите пользователя:</h4>
            <div className="users-list">
              {allUsers
                .filter(user => 
                  !selectedProject.participants.includes(user.name) && 
                  user.name !== currentUser?.name
                )
                .map(user => (
                  <div
                    key={user.id}
                    className="user-item"
                    onClick={() => onAddParticipant(user.name)}
                  >
                    {user.name}
                  </div>
                ))
              }
            </div>
            <button 
              className="close-modal-btn"
              onClick={() => onShowAddParticipant(false)}
            >
              Закрыть
            </button>
          </div>
        )}
        <div className="participants-list">
          {selectedProject.participants.map((participant, index) => (
            <div key={index} className="participant-item">
              <span className={participant === selectedProject.creator ? 'creator' : ''}>
                {participant}
                {participant === selectedProject.creator && ' (Создатель)'}
              </span>
              {isProjectCreator && participant !== selectedProject.creator && (
                <button 
                  className="remove-participant-btn"
                  onClick={() => onRemoveParticipant(participant)}
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
      <div className="no-participants">Участники не выбраны</div>
    )}
  </div>
);