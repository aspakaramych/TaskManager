import type { Project, Task, User, NewTaskData } from '../../types';
import { CreateTaskModal, EditTaskModal, ViewTaskModal } from '../TaskModals/TaskModals';
import { MultiTreeGraph } from '../TreeGraph/MultiTreeGraph';
import { areAllChildrenCompleted } from '../../utils/taskTreeUtils';

interface CenterAreaProps {
  selectedProject: Project | null;
  showCreateTask: boolean;
  newTask: NewTaskData;
  onNewTaskChange: (task: NewTaskData) => void;
  onCreateTask: () => void;
  onCancelCreateTask: () => void;
  editingTask: Task | null;
  onEditingTaskChange: (task: Task) => void;
  onUpdateTask: () => void;
  onDeleteTask: (taskId: number, removeChildren: boolean) => void;
  onCancelEditTask: () => void;
  onToggleTaskCompletion: (taskId: number) => void;
  isProjectCreator: boolean;
  currentUser: User | null;
  availableParents: Task[];
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
  isProjectCreator,
  currentUser,
  availableParents,
  isRootTask
}: CenterAreaProps) => {
  
  const checkAllChildrenCompleted = (task: Task): boolean => {
    if (!selectedProject) return true;
    return areAllChildrenCompleted(task.id, selectedProject.tasks);
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
                participants={selectedProject.participants}
                onToggleCompletion={() => onToggleTaskCompletion(editingTask.id)}
                availableParents={availableParents}
                isRootTask={isRootTask}
                areAllChildrenCompleted={checkAllChildrenCompleted(editingTask)}
              />
            ) : (
              <ViewTaskModal
                task={editingTask}
                onCancel={onCancelEditTask}
                onToggleCompletion={
                  currentUser && editingTask.assignee === currentUser.name 
                    ? () => onToggleTaskCompletion(editingTask.id) 
                    : undefined
                }
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
              participants={selectedProject.participants}
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