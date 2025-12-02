import { Task, User } from '../../types';

interface CreateTaskModalProps {
  newTask: { title: string; dueDate: string; assignee: string; parentId: number | 'root' | null };
  onNewTaskChange: (task: { title: string; dueDate: string; assignee: string; parentId: number | 'root' | null }) => void;
  onCreateTask: () => void;
  onCancel: () => void;
  participants: string[];
  availableParents: Task[];
}

export const CreateTaskModal = ({
  newTask,
  onNewTaskChange,
  onCreateTask,
  onCancel,
  participants,
  availableParents
}: CreateTaskModalProps) => (
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
        value={newTask.dueDate}
        onChange={(e) => onNewTaskChange({ ...newTask, dueDate: e.target.value })}
      />
    </div>
    <div className="form-group">
      <label>Ответственный:</label>
      <select
        value={newTask.assignee}
        onChange={(e) => onNewTaskChange({ ...newTask, assignee: e.target.value })}
      >
        <option value="">Выберите ответственного</option>
        {participants.map((participant, index) => (
          <option key={index} value={participant}>
            {participant}
          </option>
        ))}
      </select>
    </div>
    <div className="form-group">
      <label>Родительская задача:</label>
      <select
        value={newTask.parentId === null ? 'null' : newTask.parentId}
        onChange={(e) => {
          const value = e.target.value;
          const parentId = value === 'null' ? null : 
                          value === 'root' ? 'root' : 
                          parseInt(value);
          onNewTaskChange({ ...newTask, parentId });
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

interface EditTaskModalProps {
  task: Task;
  onTaskChange: (task: Task) => void;
  onUpdate: () => void;
  onDelete: (taskId: number, removeChildren: boolean) => void;
  onCancel: () => void;
  participants: string[];
  onToggleCompletion: () => void;
  availableParents: Task[];
  isRootTask: boolean;
  areAllChildrenCompleted?: boolean;
}

export const EditTaskModal = ({
  task,
  onTaskChange,
  onUpdate,
  onDelete,
  onCancel,
  participants,
  onToggleCompletion,
  availableParents,
  isRootTask,
  areAllChildrenCompleted = true
}: EditTaskModalProps) => {
  const handleDelete = () => {
    if (task.childrenIds.length > 0) {
      const removeChildren = window.confirm(
        'У этой задачи есть подзадачи. Удалить подзадачи вместе с этой задачей? ' +
        'Если нет, то подзадачи будут перемещены к родителю этой задачи.'
      );
      onDelete(task.id, removeChildren);
    } else {
      onDelete(task.id, false);
    }
  };

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
          value={task.dueDate}
          onChange={(e) => onTaskChange({ ...task, dueDate: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label>Ответственный:</label>
        <select
          value={task.assignee}
          onChange={(e) => onTaskChange({ ...task, assignee: e.target.value })}
        >
          <option value="">Не назначен</option>
          {participants.map((participant, index) => (
            <option key={index} value={participant}>
              {participant}
            </option>
          ))}
        </select>
      </div>
      {!isRootTask ? (
        <div className="form-group">
          <label>Родительская задача:</label>
          <select
            value={task.parentId === null ? 'null' : task.parentId}
            onChange={(e) => {
              const value = e.target.value;
              const parentId = value === 'null' ? null : 
                              value === 'root' ? 'root' : 
                              parseInt(value);
              onTaskChange({ ...task, parentId });
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
            checked={task.isCompleted}
            onChange={onToggleCompletion}
            className="completion-checkbox"
            disabled={!task.isCompleted && !areAllChildrenCompleted}
          />
          <span className="completion-text">Задача выполнена?</span>
        </label>
        {task.childrenIds.length > 0 && (
          <div className="completion-hint">
            {task.isCompleted 
              ? 'Все подзадачи выполнены'
              : 'Для выполнения необходимо завершить все подзадачи'
            }
          </div>
        )}
      </div>
      {!isRootTask && (
        <div className="task-stats">
          <div className="stat-item">
            Подзадачи: {task.childrenIds.length}
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
  task: Task;
  onCancel: () => void;
  onToggleCompletion?: () => void;
  currentUser: User | null;
  isRootTask: boolean;
  areAllChildrenCompleted?: boolean;
}

export const ViewTaskModal = ({
  task,
  onCancel,
  onToggleCompletion,
  currentUser,
  isRootTask,
  areAllChildrenCompleted = true
}: ViewTaskModalProps) => {
  const canToggleCompletion = currentUser && 
    (task.assignee === currentUser.name || task.assignee === '');
  
  const allChildrenCompleted = areAllChildrenCompleted;

  return (
    <div className="task-modal">
      <h3>Просмотр задачи</h3>
      <div className="task-detail-view">
        <div className="detail-row">
          <label>Название:</label>
          <span>{task.title}</span>
        </div>
        <div className="detail-row">
          <label>Срок выполнения:</label>
          <span>{task.dueDate || 'Не установлен'}</span>
        </div>
        <div className="detail-row">
          <label>Ответственный:</label>
          <span>{task.assignee || 'Не назначен'}</span>
        </div>
        <div className="detail-row">
          <label>Родительская задача:</label>
          <span>
            {isRootTask ? 'Корневая задача' : 
             task.parentId === null ? 'Нет' : 
             `Задача #${task.parentId}`}
          </span>
        </div>
        <div className="detail-row">
          <label>Подзадачи:</label>
          <span>{task.childrenIds.length} задач(и)</span>
        </div>
        <div className="detail-row">
          <label>Статус:</label>
          <span className={`status ${task.isCompleted ? 'completed' : 'in-progress'}`}>
            {task.isCompleted ? '✅ Выполнена' : '⏳ В работе'}
          </span>
        </div>
        {task.childrenIds.length > 0 && !task.isCompleted && (
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
              checked={task.isCompleted}
              onChange={onToggleCompletion}
              className="completion-checkbox"
              disabled={!task.isCompleted && !allChildrenCompleted}
            />
            <span className="completion-text">
              {task.isCompleted ? 'Отметить как не выполненную' : 'Отметить как выполненную'}
            </span>
          </label>
          {!task.isCompleted && !allChildrenCompleted && (
            <div className="completion-warning">
              Нельзя отметить как выполненную: не все подзадачи завершены
            </div>
          )}
        </div>
      )}
      
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>
          Закрыть
        </button>
      </div>
    </div>
  );
};