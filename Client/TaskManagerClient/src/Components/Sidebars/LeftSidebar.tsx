import { Project, Task, User } from '../../types';
import './LeftSidebar.css';

interface LeftSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  onBack: () => void;
  onShowCreateProject: () => void;
  onTaskClick: (task: Task) => void;
  onCreateTask: () => void;
  isProjectCreator: boolean;
  currentUser: User | null;
}

const TaskItem = ({ 
  task, 
  allTasks, 
  onTaskClick,
  depth = 0 
}: { 
  task: Task; 
  allTasks: Task[]; 
  onTaskClick: (task: Task) => void;
  depth: number;
}) => {
  const children = allTasks.filter(t => t.parentId === task.id);
  
  return (
    <>
      <div 
        className={`task-item ${task.isCompleted ? 'completed' : ''} ${children.length > 0 ? 'has-children' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => onTaskClick(task)}
      >
        <div className="task-item-content">
          <strong>{task.title}</strong>
          {task.dueDate && <div>Срок: {task.dueDate}</div>}
          {task.assignee && <div>Ответственный: {task.assignee}</div>}
          <div className="task-status">
            {task.isCompleted ? '✅ Выполнено' : '⏳ В работе'}
          </div>
          {children.length > 0 && (
            <div className="children-count">
              Подзадачи: {children.length}
            </div>
          )}
        </div>
      </div>
      {children.map(child => (
        <TaskItem
          key={child.id}
          task={child}
          allTasks={allTasks}
          onTaskClick={onTaskClick}
          depth={depth + 1}
        />
      ))}
    </>
  );
};

export const LeftSidebar = ({
  projects,
  selectedProject,
  onProjectSelect,
  onBack,
  onShowCreateProject,
  onTaskClick,
  onCreateTask,
  isProjectCreator,
  currentUser
}: LeftSidebarProps) => {
  const rootLevelTasks = selectedProject?.tasks.filter(t => 
    t.parentId === null || t.parentId === 'root'
  ) || [];

  return (
    <div className="left-sidebar">
      {selectedProject ? (
        <div className="project-details">
          <button className="back-btn" onClick={onBack}>
            Назад к проектам
          </button>
          <h3>Задачи проекта:</h3>
          {isProjectCreator && (
            <button className="create-task-btn" onClick={onCreateTask}>
              Создать новую задачу
            </button>
          )}
          <div className="tasks-tree">
            {rootLevelTasks.length > 0 ? (
              rootLevelTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  allTasks={selectedProject.tasks}
                  onTaskClick={onTaskClick}
                  depth={0}
                />
              ))
            ) : (
              <div className="no-tasks">Задачи пока не созданы</div>
            )}
          </div>
        </div>
      ) : (
        <div className="projects-list">
          {currentUser ? (
            <>
              <button className="create-project-btn" onClick={onShowCreateProject}>
                Создать новый проект
              </button>
              <h3>Мои проекты:</h3>
              {projects.length === 0 ? (
                <div className="no-projects">Проектов пока нет</div>
              ) : (
                projects.map(project => (
                  <div
                    key={project.id}
                    className="project-item"
                    onClick={() => onProjectSelect(project)}
                  >
                    {project.title}
                    {project.creator === currentUser.username && (
                      <span className="creator-badge">Создатель</span>
                    )}
                  </div>
                ))
              )}
            </>
          ) : (
            <div className="login-prompt">
              <p>Войдите, чтобы увидеть свои проекты</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};