import React from 'react';
import { TaskResponse, UserInTeamDto } from '../../types';
import { updateTask } from '../Api/mainApi.ts';

interface UpdateTaskModalProps {
    task: TaskResponse;
    projectId: string;
    teamUsers: UserInTeamDto[];
    availableParents: TaskResponse[];
    isRootTask: boolean;
    onUpdate: (updatedTask: TaskResponse) => void;
    onCancel: () => void;
    currentUser: { username: string; email: string; firstName: string; lastName: string; } | null;
}

export const UpdateTaskModal = ({
                                    task,
                                    projectId,
                                    teamUsers,
                                    availableParents,
                                    isRootTask,
                                    onUpdate,
                                    onCancel,
                                    currentUser
                                }: UpdateTaskModalProps) => {
    const [updatedTask, setUpdatedTask] = React.useState<TaskResponse>({ ...task });
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string>('');

    const formatDateForInput = (date: Date): string => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleUpdateTask = async () => {
        try {
            setLoading(true);
            setError('');

            const taskUpdateDto = {
                title: updatedTask.title,
                description: updatedTask.description || null,
                deadline: updatedTask.deadline instanceof Date ?
                    updatedTask.deadline.toISOString() :
                    updatedTask.deadline,
                progress: updatedTask.progress,
            };

            console.log('🚨 UpdateTaskModal: Отправляю данные:', taskUpdateDto);

            await updateTask(taskUpdateDto, projectId, task.id);

            console.log('🚨 UpdateTaskModal: API успешно!');

            alert('✅ Задача обновлена!');

            // ВАЖНО: Сначала вызываем onUpdate, чтобы передать обновленную задачу
            console.log('🚨 UpdateTaskModal: Вызываю onUpdate с задачей:', updatedTask);
            onUpdate(updatedTask); // ← ЭТОГО НЕ ХВАТАЛО!

            // Потом закрываем модалку
            onCancel();

        } catch (err: any) {
            console.error('Ошибка обновления:', err);
            setError(err.message || 'Не удалось обновить задачу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="task-modal">
            <h3>Обновление задачи</h3>

            {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
                    {error}
                </div>
            )}

            <div className="form-group">
                <label>Название задачи:</label>
                <input
                    type="text"
                    value={updatedTask.title}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, title: e.target.value })}
                    placeholder="Введите название задачи"
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label>Описание:</label>
                <textarea
                    value={updatedTask.description || ''}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, description: e.target.value })}
                    placeholder="Введите описание задачи"
                    disabled={loading}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label>Срок выполнения:</label>
                <input
                    type="date"
                    value={formatDateForInput(updatedTask.deadline)}
                    onChange={(e) => {
                        const value = e.target.value;
                        const newDate = value ? new Date(value + 'T00:00:00') : new Date();
                        setUpdatedTask({ ...updatedTask, deadline: newDate });
                    }}
                    disabled={loading}
                />
            </div>

            <div className="form-group">
                <label>Ответственный:</label>
                <select
                    value={updatedTask.assigneeId || ''}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, assigneeId: e.target.value || null })}
                    disabled={loading}
                >
                    <option value="">Не назначен</option>
                    {teamUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username}
                        </option>
                    ))}
                </select>
            </div>

            {!isRootTask ? (
                <div className="form-group">
                    <label>Родительская задача:</label>
                    <select
                        value={updatedTask.taskHeadId || 'null'}
                        onChange={(e) => {
                            const value = e.target.value;
                            const taskHeadId = value === 'null' ? null : value;
                            setUpdatedTask({ ...updatedTask, taskHeadId });
                        }}
                        disabled={loading}
                    >
                        <option value="null">Нет (самостоятельная задача)</option>
                        {availableParents
                            .filter(parent => parent.id !== task.id)
                            .map(parentTask => (
                                <option key={parentTask.id} value={parentTask.id}>
                                    {parentTask.title}
                                </option>
                            ))}
                    </select>
                </div>
            ) : (
                <div className="form-group">
                    <label>Родительская задача:</label>
                    <input
                        type="text"
                        value="Корневая задача (неизменяемо)"
                        disabled
                        className="disabled-input"
                    />
                </div>
            )}

            <div className="form-group">
                <label>Статус:</label>
                <select
                    value={updatedTask.progress || 'Created'}
                    onChange={(e) => setUpdatedTask({ ...updatedTask, progress: e.target.value as any })}
                    disabled={loading}
                >
                    <option value="Created">📝 Создано</option>
                    <option value="Taken">⏳ В работе</option>
                    <option value="Done">✅ Выполнено</option>
                    <option value="Canceled">❌ Отменено</option>
                </select>
            </div>

            <div className="modal-actions">
                <button
                    className="confirm-btn"
                    onClick={handleUpdateTask}
                    disabled={loading}
                    style={{ backgroundColor: '#4CAF50' }}
                >
                    {loading ? 'Обновление...' : 'Сохранить изменения'}
                </button>
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Отмена
                </button>
            </div>
        </div>
    );
};