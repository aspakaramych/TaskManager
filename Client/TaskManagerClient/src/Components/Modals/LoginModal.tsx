import { User } from '../../types';

interface LoginModalProps {
  users: User[];
  onLogin: (user: User) => void;
  onCancel: () => void;
}

export const LoginModal = ({ users, onLogin, onCancel }: LoginModalProps) => (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Выберите пользователя</h2>
      <div className="users-selection">
        {users.map(user => (
          <div 
            key={user.id} 
            className="user-selection-item"
            onClick={() => onLogin(user)}
          >
            {user.name}
          </div>
        ))}
      </div>
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  </div>
);