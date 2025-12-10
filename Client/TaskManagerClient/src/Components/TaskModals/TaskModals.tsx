import React from 'react';
import { TaskResponse, User, NewTaskData, UserInTeamDto, TaskProgress } from '../../types';
import { TaskInfo, getTaskInfo, assignTask, rejectTask, deleteTask } from '../Api/mainApi';
import { formatDeadline } from '../../utils/taskTreeUtils';

interface CreateTaskModalProps {
  newTask: NewTaskData;
  onNewTaskChange: (task: NewTaskData) => void;
  onCreateTask: () => void;
  onCancel: () => void;
  teamUsers: UserInTeamDto[];
  availableParents: TaskResponse[];
}

export const CreateTaskModal = ({
  newTask,
  onNewTaskChange,
  onCreateTask,
  onCancel,
  teamUsers,
  availableParents
}: CreateTaskModalProps) => {
  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="task-modal">
      <h3>Создание новой задачи</h3>
      <div className="form-group">
        <label>Название задачи:</label>
        <input
          type="text"
          value={newTask.title}
          onChange={(e) => onNewTaskChange({ ...newTask, title: e.target.value })}
          placeholder="Введите название задачи"
        />
      </div>
      <div className="form-group">
        <label>Срок выполнения:</label>
        <input
          type="date"
          value={formatDateForInput(newTask.deadline)}
          onChange={(e) => onNewTaskChange({ ...newTask, deadline: new Date(e.target.value) })}
        />
      </div>
      <div className="form-group">
        <label>Ответственный:</label>
        <select
          value={newTask.assigneeId || ''}
          onChange={(e) => onNewTaskChange({ ...newTask, assigneeId: e.target.value || null })}
        >
          <option value="">Выберите ответственного</option>
          {teamUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.username}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Родительская задача:</label>
        <select
          value={newTask.taskHeadId || 'null'}
          onChange={(e) => {
            const value = e.target.value;
            const taskHeadId = value === 'null' ? null : value;
            onNewTaskChange({ ...newTask, taskHeadId });
          }}
        >
          <option value="null">Нет (самостоятельная задача)</option>
          {availableParents.map(task => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </div>
      <div className="modal-actions">
        <button className="confirm-btn" onClick={onCreateTask}>
          Создать
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  );
};

interface EditTaskModalProps {
  task: TaskResponse;
  onTaskChange: (task: TaskResponse) => void;
  onUpdate: () => void;
  onDelete: (taskId: string, removeChildren: boolean) => void;
  onCancel: () => void;
  teamUsers: UserInTeamDto[];
  onToggleCompletion: () => void;
  availableParents: TaskResponse[];
  isRootTask: boolean;
  areAllChildrenCompleted?: boolean;
}

export const EditTaskModal = ({
  task,
  onTaskChange,
  onUpdate,
  onDelete,
  onCancel,
  teamUsers,
  onToggleCompletion,
  availableParents,
  isRootTask,
  areAllChildrenCompleted = true
}: EditTaskModalProps) => {
  const handleDelete = () => {
    if (task.children && task.children.length > 0) {
      const removeChildren = window.confirm(
        'У этой задачи есть подзадачи. Удалить подзадачи вместе с этой задачей? ' +
        'Если нет, то подзадачи будут перемещены к родителю этой задачи.'
      );
      onDelete(task.id, removeChildren);
    } else {
      onDelete(task.id, false);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDone = task.progress === TaskProgress.Done;

  return (
    <div className="task-modal">
      <h3>Редактирование задачи</h3>
      <div className="form-group">
        <label>Название задачи:</label>
        <input
          type="text"
          value={task.title}
          onChange={(e) => onTaskChange({ ...task, title: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Срок выполнения:</label>
        <input
          type="date"
          value={formatDateForInput(task.deadline)}
          onChange={(e) => onTaskChange({ ...task, deadline: new Date(e.target.value) })}
        />
      </div>
      <div className="form-group">
        <label>Ответственный:</label>
        <select
          value={task.assigneeId || ''}
          onChange={(e) => onTaskChange({ ...task, assigneeId: e.target.value || null })}
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
            value={task.taskHeadId || 'null'}
            onChange={(e) => {
              const value = e.target.value;
              const taskHeadId = value === 'null' ? null : value;
              onTaskChange({ ...task, taskHeadId });
            }}
          >
            <option value="null">Нет (самостоятельная задача)</option>
            {availableParents.map(parentTask => (
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
      <div className="form-group completion-toggle">
        <label className="completion-toggle-label">
          <input
            type="checkbox"
            checked={isDone}
            onChange={onToggleCompletion}
            className="completion-checkbox"
            disabled={!isDone && !areAllChildrenCompleted}
          />
          <span className="completion-text">Задача выполнена?</span>
        </label>
        {task.children && task.children.length > 0 && (
          <div className="completion-hint">
            {isDone
              ? 'Все подзадачи выполнены'
              : 'Для выполнения необходимо завершить все подзадачи'
            }
          </div>
        )}
      </div>
      {!isRootTask && (
        <div className="task-stats">
          <div className="stat-item">
            Подзадачи: {task.children ? task.children.length : 0}
          </div>
        </div>
      )}
      <div className="modal-actions">
        <button className="confirm-btn" onClick={onUpdate}>
          Сохранить
        </button>
        {!isRootTask && (
          <button className="delete-btn" onClick={handleDelete}>
            Удалить задачу
          </button>
        )}
        <button className="cancel-btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </div>
  );
};

interface ViewTaskModalProps {
  task: TaskResponse;
  projectId: string;
  onCancel: () => void;
  onToggleCompletion?: () => void;
  onTaskAssigned?: () => void;
  onTaskDeleted?: (taskId: string) => void;
  currentUser: User | null;
  isRootTask: boolean;
  areAllChildrenCompleted?: boolean;
    onShowUpdateTask?: (task: TaskResponse) => void;
}

export const ViewTaskModal = ({
  task,
  projectId,
  onCancel,
  onToggleCompletion,
  onTaskAssigned,
    onTaskDeleted,
  currentUser,
  isRootTask,
  areAllChildrenCompleted = true,
    onShowUpdateTask
}: ViewTaskModalProps) => {
  const [taskInfo, setTaskInfo] = React.useState<TaskInfo | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string>('');
  const [assigning, setAssigning] = React.useState<boolean>(false);
  const [rejecting, setRejecting] = React.useState<boolean>(false);
    const [deleting, setDeleting] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadTaskInfo();
  }, [task.id, projectId]);

  const loadTaskInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const info = await getTaskInfo(projectId, task.id);
      setTaskInfo(info);
    } catch (err) {
      console.error('Error loading task info:', err);
      setError('Не удалось загрузить детальную информацию о задаче');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async () => {
    try {
      setAssigning(true);
      setError('');
      await assignTask(projectId, task.id);

      await loadTaskInfo();

      if (onTaskAssigned) {
        onTaskAssigned();
      }
    } catch (err) {
      console.error('Error assigning task:', err);
      setError('Не удалось взять задачу');
    } finally {
      setAssigning(false);
    }
  };

  const handleRejectTask = async () => {
    try {
      setRejecting(true);
      setError('');
      await rejectTask(projectId, task.id);

      await loadTaskInfo();

      if (onTaskAssigned) {
        onTaskAssigned();
      }
    } catch (err) {
      console.error('Error rejecting task:', err);
      setError('Не удалось отказаться от задачи');
    } finally {
      setRejecting(false);
    }
  };

    const handleDeleteTask = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
            return;
        }

        try {
            setDeleting(true);
            setError('');

            await deleteTask(projectId, task.id);

            if (onTaskDeleted) {
                onTaskDeleted(task.id);
            }

            onCancel();

        } catch (err) {
            console.error('Error deleting task:', err);
            setError('Не удалось удалить задачу');
        } finally {
            setDeleting(false);
        }
    };

  const canToggleCompletion = currentUser &&
    (task.assigneeId === currentUser.username || !task.assigneeId);

  const isAssignedToMe = currentUser && taskInfo?.users?.includes(currentUser.username);

  const hasAssignees = taskInfo?.users && taskInfo.users.length > 0;

  const canAssignTask = currentUser && !hasAssignees && (!task.assigneeId);

  const canRejectTask = isAssignedToMe || (currentUser && task.assigneeId === currentUser.username);

  const allChildrenCompleted = areAllChildrenCompleted;
  const isDone = task.progress === TaskProgress.Done;

  if (loading) {
    return (
      <div className="task-modal">
        <h3>Просмотр задачи</h3>
        <div className="loading-message">Загрузка информации о задаче...</div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-modal">
        <h3>Просмотр задачи</h3>
        <div className="error-message">{error}</div>
        <div className="task-detail-view">
          <div className="detail-row">
            <label>Название:</label>
            <span>{task.title}</span>
          </div>
          <div className="detail-row">
            <label>Срок выполнения:</label>
            <span>{task.deadline ? formatDeadline(task.deadline) : 'Не установлен'}</span>
          </div>
        </div>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-modal">
      <h3>Просмотр задачи</h3>
      <div className="task-detail-view">
        <div className="detail-row">
          <label>Название:</label>
          <span>{taskInfo?.title || task.title}</span>
        </div>
        <div className="detail-row">
          <label>Описание:</label>
          <span>{taskInfo?.description || 'Нет описания'}</span>
        </div>
        <div className="detail-row">
          <label>Срок выполнения:</label>
          <span>{taskInfo?.deadline ? formatDeadline(taskInfo.deadline) : task.deadline ? formatDeadline(task.deadline) : 'Не установлен'}</span>
        </div>
        <div className="detail-row">
          <label>Ответственный:</label>
          <span>
            {taskInfo?.users && taskInfo.users.length > 0
              ? taskInfo.users.join(', ')
              : task.assigneeName || 'Не назначен'}
          </span>
        </div>
        <div className="detail-row">
          <label>Родительская задача:</label>
          <span>
            {isRootTask ? 'Корневая задача' :
              taskInfo?.taskHeadName ? taskInfo.taskHeadName :
                task.taskHeadId === null ? 'Нет' :
                  `Задача #${task.taskHeadId}`}
          </span>
        </div>
        <div className="detail-row">
          <label>Подзадачи:</label>
          <span>{task.children ? task.children.length : 0} задач(и)</span>
        </div>
        <div className="detail-row">
          <label>Статус:</label>
          <span className={`status ${isDone ? 'completed' : 'in-progress'}`}>
            {taskInfo?.status || (isDone ? '✅ Выполнена' :
              task.progress === TaskProgress.Taken ? '⏳ В работе' :
                task.progress === TaskProgress.Canceled ? '❌ Отменено' :
                  '📝 Создано')}
          </span>
        </div>
        {task.children && task.children.length > 0 && !isDone && (
          <div className="detail-row">
            <label>Требования:</label>
            <span className="requirement">
              Для выполнения необходимо завершить все подзадачи
            </span>
          </div>
        )}
      </div>

      {onToggleCompletion && canToggleCompletion && (
        <div className="completion-section">
          <label className="completion-toggle-label">
            <input
              type="checkbox"
              checked={isDone}
              onChange={onToggleCompletion}
              className="completion-checkbox"
              disabled={!isDone && !allChildrenCompleted}
            />
            <span className="completion-text">
              {isDone ? 'Отметить как не выполненную' : 'Отметить как выполненную'}
            </span>
          </label>
          {!isDone && !allChildrenCompleted && (
            <div className="completion-warning">
              Нельзя отметить как выполненную: не все подзадачи завершены
            </div>
          )}
        </div>
      )}

      <div className="modal-actions">
        {canAssignTask && (
          <button
            className="confirm-btn"
            onClick={handleAssignTask}
            disabled={assigning}
          >
            {assigning ? 'Назначение...' : 'Взять задачу'}
          </button>
        )}
        {canRejectTask && (
          <button
            className="delete-btn"
            onClick={handleRejectTask}
            disabled={rejecting}
          >
            {rejecting ? 'Отказ...' : 'Отказаться от задачи'}
          </button>
        )}
          <button
              className="update-btn"
              onClick={() => onShowUpdateTask && onShowUpdateTask(task)}
              style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  marginLeft: '10px'
              }}
          >
              Обновить задачу
          </button>

              <button
                  className="delete-task-btn"
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  style={{
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      marginLeft: '10px'
                  }}
              >
                  {deleting ? 'Удаление...' : 'Удалить задачу'}
              </button>
        <button className="cancel-btn" onClick={onCancel}>
          Закрыть
        </button>
      </div>
    </div>
  );
};