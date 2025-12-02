import { Task } from '../../types';
import './TaskTree.css';

interface TaskTreeProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  currentUser: string | null;
  isProjectCreator: boolean;
}

interface TreeNodeProps {
  task: Task;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  currentUser: string | null;
  isProjectCreator: boolean;
  depth: number;
}

const TreeNode = ({ 
  task, 
  tasks, 
  onTaskClick, 
  currentUser, 
  isProjectCreator, 
  depth 
}: TreeNodeProps) => {
  const children = tasks.filter(t => t.parentId === task.id);
  const hasChildren = children.length > 0;

  return (
    <div className="tree-node">
      <div 
        className={`task-node ${task.isCompleted ? 'completed' : ''} ${hasChildren ? 'has-children' : ''}`}
        style={{ marginLeft: `${depth * 25}px` }}
        onClick={() => onTaskClick(task)}
      >
        <div className="task-node-content">
          <div className="task-node-main">
            <div className="task-status-indicator">
              {task.isCompleted ? '✅' : '⏳'}
            </div>
            <div className="task-info">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                {task.assignee && <span className="assignee">👤 {task.assignee}</span>}
                {task.dueDate && <span className="due-date">📅 {task.dueDate}</span>}
              </div>
            </div>
          </div>
          {hasChildren && (
            <div className="children-count">
              {children.length} подзадач{children.length === 1 ? 'а' : ''}
            </div>
          )}
        </div>
        {depth > 0 && <div className="connector-line"></div>}
      </div>
      {hasChildren && (
        <div className="children-container">
          {children.map(child => (
            <TreeNode
              key={child.id}
              task={child}
              tasks={tasks}
              onTaskClick={onTaskClick}
              currentUser={currentUser}
              isProjectCreator={isProjectCreator}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TaskTree = ({ tasks, onTaskClick, currentUser, isProjectCreator }: TaskTreeProps) => {
  const rootTasks = tasks.filter(task =>
    task.parentId === null || task.parentId === 'root'
  );

  if (rootTasks.length === 0) {
    return (
      <div className="empty-tree">
        <h3>Дерево задач пусто</h3>
        <p>Создайте первую задачу для начала работы</p>
      </div>
    );
  }

  return (
    <div className="task-tree">
      <div className="tree-header">
        <h3>Дерево задач проекта</h3>
        <div className="tree-stats">
          <span>Всего задач: {tasks.length}</span>
          <span>Выполнено: {tasks.filter(t => t.isCompleted).length}</span>
        </div>
      </div>
      <div className="tree-container">
        {rootTasks.map(task => (
          <TreeNode
            key={task.id}
            task={task}
            tasks={tasks}
            onTaskClick={onTaskClick}
            currentUser={currentUser}
            isProjectCreator={isProjectCreator}
            depth={0}
          />
        ))}
      </div>
    </div>
  );
};