import { useState, useEffect } from 'react';
import { UserResponse, RoleType, addUserToTeam, getUsers, AddUserToTeamDto } from '../Api/mainApi';
import './AddUserToProjectModal.css';

interface AddUserToProjectModalProps {
    projectId: string;
    teamId: string;
    onClose: () => void;
    onUserAdded?: () => void;
}

export const AddUserToProjectModal = ({
    projectId,
    teamId,
    onClose,
    onUserAdded
}: AddUserToProjectModalProps) => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedRole, setSelectedRole] = useState<RoleType>(RoleType.Backend);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const usersData = await getUsers();
            setUsers(usersData);
            setError('');
        } catch (err) {
            setError('Не удалось загрузить список пользователей');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        if (!selectedUserId) {
            setError('Пожалуйста, выберите пользователя');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const userToAdd: AddUserToTeamDto = {
                userId: selectedUserId,
                teamId: teamId,
                role: selectedRole
            };

            await addUserToTeam(projectId, userToAdd);

            if (onUserAdded) {
                onUserAdded();
            }

            onClose();
        } catch (err) {
            setError('Не удалось добавить пользователя в проект');
            console.error('Error adding user to team:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content add-user-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Добавить участника в проект</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label>Поиск пользователя:</label>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Введите имя пользователя..."
                        className="search-input"
                    />
                </div>

                <div className="form-group">
                    <label>Выберите пользователя:</label>
                    <div className="users-list">
                        {loading ? (
                            <div className="loading-message">Загрузка пользователей...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="no-users-message">
                                {searchQuery ? 'Пользователи не найдены' : 'Нет доступных пользователей'}
                            </div>
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedUserId(user.id)}
                                >
                                    <div className="user-info">
                                        <span className="user-icon">👤</span>
                                        <span className="username">{user.username}</span>
                                    </div>
                                    {selectedUserId === user.id && (
                                        <span className="checkmark">✓</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Роль в проекте:</label>
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as RoleType)}
                        className="role-select"
                    >
                        <option value={RoleType.ProjectManager}>Project Manager</option>
                        <option value={RoleType.Backend}>Backend Developer</option>
                        <option value={RoleType.Frontend}>Frontend Developer</option>
                        <option value={RoleType.Designer}>Designer</option>
                        <option value={RoleType.Mobile}>Mobile Developer</option>
                    </select>
                </div>

                <div className="modal-actions">
                    <button
                        className="confirm-btn"
                        onClick={handleAddUser}
                        disabled={loading || !selectedUserId}
                    >
                        {loading ? 'Добавление...' : 'Добавить'}
                    </button>
                    <button
                        className="cancel-btn"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};
