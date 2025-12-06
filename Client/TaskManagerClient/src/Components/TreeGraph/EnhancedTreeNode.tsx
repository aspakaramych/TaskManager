import React, { useState } from 'react';
import { TaskResponse, TaskProgress } from '../../types';
import { formatDeadline } from '../../utils/taskTreeUtils';

interface EnhancedTreeNodeProps {
  task: TaskResponse;
  onTaskClick: (task: TaskResponse) => void;
  onToggle?: () => void;
  isOpen?: boolean;
  hasChildren?: boolean;
  isCompleted?: boolean;
  isRootLevel?: boolean;
}

export const EnhancedTreeNode: React.FC<EnhancedTreeNodeProps> = ({
  task,
  onTaskClick,
  onToggle,
  isOpen = false,
  hasChildren = false,
  isCompleted = false,
  isRootLevel = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick(task);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle) onToggle();
  };

  const isDone = task.progress === TaskProgress.Done;

  const getNodeStyles = () => {
    const baseStyles = {
      background: isDone ? '#e8f5e8' : '#ffffff',
      borderColor: isDone ? '#2ed573' : isRootLevel ? '#ffa502' : '#3742fa',
      color: isDone ? '#2d3748' : '#2d3748'
    };

    if (isHovered) {
      baseStyles.background = isDone ? '#d4edda' : '#f8f9fa';
    }

    return baseStyles;
  };

  const getStatusStyles = () => {
    if (isDone) {
      return { background: '#2ed573', color: 'white' };
    }
    if (task.progress === TaskProgress.Taken) {
      return { background: '#3742fa', color: 'white' };
    }
    if (task.progress === TaskProgress.Canceled) {
      return { background: '#ff4757', color: 'white' };
    }
    return { background: '#ffa502', color: 'white' };
  };

  const getPriorityStyles = () => {
    if (!task.deadline) return { background: '#95a5a6', color: 'white' };

    const dueDate = new Date(task.deadline);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { background: '#ff4757', color: 'white' }; // Просрочено
    if (diffDays <= 3) return { background: '#ffa502', color: 'white' }; // Срочно
    if (diffDays <= 7) return { background: '#3742fa', color: 'white' }; // Скоро срок

    return { background: '#2ed573', color: 'white' }; // Есть время
  };

  const styles = getNodeStyles();
  const statusStyles = getStatusStyles();
  const priorityStyles = getPriorityStyles();

  return (
    <div
      className={`enhanced-tree-node ${isDone ? 'completed' : ''} ${isRootLevel ? 'root-level' : ''}`}
      style={styles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Заголовок и статус */}
      <div className="node-header">
        <div className="task-title">
          <h4 title={task.title}>
            {task.title.length > 30 ? task.title.substring(0, 30) + '...' : task.title}
          </h4>
          {hasChildren && (
            <button
              className="toggle-btn"
              onClick={handleToggleClick}
              title={isOpen ? 'Свернуть подзадачи' : 'Развернуть подзадачи'}
            >
              {isOpen ? '−' : '+'}
            </button>
          )}
        </div>
        <div className="status-badge" style={statusStyles}>
          {isDone ? '✅ Выполнено' :
            task.progress === TaskProgress.Taken ? '⏳ В работе' :
              task.progress === TaskProgress.Canceled ? '❌ Отменено' :
                '📝 Создано'}
        </div>
      </div>

      {/* Детали задачи */}
      <div className="node-details">
        {task.assigneeName && (
          <div className="detail-item assignee">
            <span className="icon">👤</span>
            <span className="text" title={task.assigneeName}>
              {task.assigneeName.length > 15 ? task.assigneeName.substring(0, 15) + '...' : task.assigneeName}
            </span>
          </div>
        )}

        {task.deadline && (
          <div className="detail-item due-date">
            <span className="icon">📅</span>
            <span className="text">
              {new Date(task.deadline).toLocaleDateString('ru-RU')}
            </span>
          </div>
        )}

        {task.children && task.children.length > 0 && (
          <div className="detail-item children-count">
            <span className="icon">📂</span>
            <span className="text">
              {task.children.length} подзадач
            </span>
          </div>
        )}
      </div>

      {/* Приоритет и дополнительные индикаторы */}
      <div className="node-footer">
        <div className="priority-indicator" style={priorityStyles}>
          {!task.deadline ? 'Без срока' :
            new Date(task.deadline) < new Date() ? 'Просрочено' :
              'В сроке'}
        </div>

        {task.description && task.description !== 'Описание задачи' && (
          <div className="description-hint" title={task.description}>
            📝
          </div>
        )}
      </div>

      {/* Индикатор корневой задачи */}
      {isRootLevel && (
        <div className="root-indicator" title="Корневая задача">
          ⭐
        </div>
      )}
    </div>
  );
};