import { ProjectInfoDto, TaskResponse, User, TaskProgress } from '../../types';
import './LeftSidebar.css';
import { formatDeadline } from '../../utils/taskTreeUtils';

interface LeftSidebarProps {
    projects: ProjectInfoDto[];
    selectedProject: ProjectInfoDto | null;
    onProjectSelect: (project: ProjectInfoDto) => void;
    onBack: () => void;
    onShowCreateProject: () => void;
    onTaskClick: (task: TaskResponse) => void;
    onCreateTask: () => void;
    isProjectCreator: boolean;
    currentUser: { username: string; email: string; firstName: string; lastName: string; } | null;
}

const TaskItem = ({
  task,
  onTaskClick,
  depth = 0
}: {
  task: TaskResponse;
  onTaskClick: (task: TaskResponse) => void;
  depth: number;
}) => {
  const children = task.children || [];
  const isDone = task.progress === TaskProgress.Done;

  return (
    <>
      <div
        className={`task-item ${isDone ? 'completed' : ''} ${children.length > 0 ? 'has-children' : ''}`}
        style={{ marginLeft: `${depth * 20}px` }}
        onClick={() => onTaskClick(task)}
      >
        <div className="task-item-content">
          <strong>{task.title}</strong>
          {task.deadline && <div>Срок: {formatDeadline(task.deadline)}</div>}
          {task.assigneeName && <div>Ответственный: {task.assigneeName}</div>}
          <div className="task-status">
            {isDone ? '✅ Выполнено' :
              task.progress === TaskProgress.Taken ? '⏳ В работе' :
                task.progress === TaskProgress.Canceled ? '❌ Отменено' :
                  '📝 Создано'}
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
    const rootLevelTasks = selectedProject?.tasks || [];

    console.log('LeftSidebar Debug detailed:', {
        currentUser,
        currentUserType: typeof currentUser,
        currentUserUsername: currentUser?.username,
        isProjectCreator,
        selectedProjectTitle: selectedProject?.title
    });

    const shouldShowCreateTaskButton = selectedProject && currentUser;

    return (
        <div className="left-sidebar">
            {selectedProject ? (
                <div className="project-details">
                    <div className="project-actions">
                        <button className="back-btn" onClick={onBack}>
                            Назад к проектам
                        </button>
                        {shouldShowCreateTaskButton && (
                            <button className="create-task-btn" onClick={onCreateTask}>
                                Создать задачу
                            </button>
                        )}
                    </div>
                    <h3>Задачи проекта:</h3>
                    <div className="tasks-tree">
                        {rootLevelTasks.length > 0 ? (
                            rootLevelTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
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
                                        {project.team.users.some(u =>
                                            u.username === currentUser.username &&
                                            u.role === 'Creator'
                                        ) && (
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