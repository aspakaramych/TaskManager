import { TaskResponse, TaskProgress } from '../../types';
import './TaskTree.css';

interface TaskTreeProps {
  tasks: TaskResponse[];
  onTaskClick: (task: TaskResponse) => void;
  currentUser: string | null;
  isProjectCreator: boolean;
}

interface TreeNodeProps {
  task: TaskResponse;
  onTaskClick: (task: TaskResponse) => void;
  currentUser: string | null;
  isProjectCreator: boolean;
  depth: number;
}

const TreeNode = ({
  task,
  onTaskClick,
  currentUser,
  isProjectCreator,
  depth
}: TreeNodeProps) => {
  const children = task.children || [];
  const hasChildren = children.length > 0;
  const isDone = task.progress === TaskProgress.Done;

  return (
    <div className="tree-node">
      <div
        className={`task-node ${isDone ? 'completed' : ''} ${hasChildren ? 'has-children' : ''}`}
        style={{ marginLeft: `${depth * 25}px` }}
        onClick={() => onTaskClick(task)}
      >
        <div className="task-node-content">
          <div className="task-node-main">
            <div className="task-status-indicator">
              {isDone ? '✅' :
                task.progress === TaskProgress.Taken ? '⏳' :
                  task.progress === TaskProgress.Canceled ? '❌' :
                    '📝'}
            </div>
            <div className="task-info">
              <div className="task-title">{task.title}</div>
              <div className="task-meta">
                {task.assigneeName && <span className="assignee">👤 {task.assigneeName}</span>}
                {task.deadline && <span className="due-date">📅 {new Date(task.deadline).toLocaleDateString('ru-RU')}</span>}
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
  const rootTasks = tasks;

  if (rootTasks.length === 0) {
    return (
      <div className="empty-tree">
        <h3>Дерево задач пусто</h3>
        <p>Создайте первую задачу для начала работы</p>
      </div>
    );
  }

  const flattenTasks = (tasks: TaskResponse[]): TaskResponse[] => {
    const result: TaskResponse[] = [];
    const flatten = (task: TaskResponse) => {
      result.push(task);
      if (task.children && task.children.length > 0) {
        task.children.forEach(child => flatten(child));
      }
    };
    tasks.forEach(task => flatten(task));
    return result;
  };

  const allTasks = flattenTasks(tasks);
  const completedCount = allTasks.filter(t => t.progress === TaskProgress.Done).length;

  return (
    <div className="task-tree">
      <div className="tree-header">
        <h3>Дерево задач проекта</h3>
        <div className="tree-stats">
          <span>Всего задач: {allTasks.length}</span>
          <span>Выполнено: {completedCount}</span>
        </div>
      </div>
      <div className="tree-container">
        {rootTasks.map(task => (
          <TreeNode
            key={task.id}
            task={task}
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