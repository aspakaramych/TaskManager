import type { ProjectInfoDto, TaskResponse, User, NewTaskData } from '../../types';
import { CreateTaskModal, EditTaskModal, ViewTaskModal } from '../TaskModals/TaskModals';
import { MultiTreeGraph } from '../TreeGraph/MultiTreeGraph';
import { areAllChildrenCompleted, flattenTasks } from '../../utils/taskTreeUtils';

interface CenterAreaProps {
  selectedProject: ProjectInfoDto | null;
  showCreateTask: boolean;
  newTask: NewTaskData;
  onNewTaskChange: (task: NewTaskData) => void;
  onCreateTask: () => void;
  onCancelCreateTask: () => void;
  editingTask: TaskResponse | null;
  onEditingTaskChange: (task: TaskResponse) => void;
  onUpdateTask: () => void;
  onDeleteTask: (taskId: string, removeChildren: boolean) => void;
  onCancelEditTask: () => void;
  onToggleTaskCompletion: (taskId: string) => void;
  onTaskAssigned?: () => void;
  isProjectCreator: boolean;
  currentUser: User | null;
  availableParents: TaskResponse[];
  isRootTask: boolean;
}

export const CenterArea = ({
  selectedProject,
  showCreateTask,
  newTask,
  onNewTaskChange,
  onCreateTask,
  onCancelCreateTask,
  editingTask,
  onEditingTaskChange,
  onUpdateTask,
  onDeleteTask,
  onCancelEditTask,
  onToggleTaskCompletion,
  onTaskAssigned,
  isProjectCreator,
  currentUser,
  availableParents,
  isRootTask
}: CenterAreaProps) => {

  const checkAllChildrenCompleted = (task: TaskResponse): boolean => {
    if (!selectedProject) return true;
    const flatTasks = flattenTasks(selectedProject.tasks);
    return areAllChildrenCompleted(task.id, flatTasks);
  };

  return (
    <div className="center-area">
      {selectedProject ? (
        <div className="workspace">
          {editingTask ? (
            isProjectCreator ? (
              <EditTaskModal
                task={editingTask}
                onTaskChange={onEditingTaskChange}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onCancel={onCancelEditTask}
                teamUsers={selectedProject.team.users}
                onToggleCompletion={() => onToggleTaskCompletion(editingTask.id)}
                availableParents={availableParents}
                isRootTask={isRootTask}
                areAllChildrenCompleted={checkAllChildrenCompleted(editingTask)}
              />
            ) : (
              <ViewTaskModal
                task={editingTask}
                projectId={selectedProject.id}
                onCancel={onCancelEditTask}
                onToggleCompletion={
                  currentUser && editingTask.assigneeId === currentUser.username
                    ? () => onToggleTaskCompletion(editingTask.id)
                    : undefined
                }
                onTaskAssigned={onTaskAssigned}
                currentUser={currentUser}
                isRootTask={isRootTask}
                areAllChildrenCompleted={checkAllChildrenCompleted(editingTask)}
              />
            )
          ) : showCreateTask ? (
            <CreateTaskModal
              newTask={newTask}
              onNewTaskChange={onNewTaskChange}
              onCreateTask={onCreateTask}
              onCancel={onCancelCreateTask}
              teamUsers={selectedProject.team.users}
              availableParents={availableParents}
            />
          ) : (
            <MultiTreeGraph
              project={selectedProject}
              onTaskClick={onEditingTaskChange}
            />
          )}
        </div>
      ) : (
        <div className="workspace">
          {currentUser ? (
            <>
              <h2>Добро пожаловать в Project Manager</h2>
              <p>Выберите проект для работы или создайте новый</p>
            </>
          ) : (
            <>
              <h2>Добро пожаловать в Project Manager</h2>
              <p>Войдите в систему, чтобы начать работу с проектами</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};