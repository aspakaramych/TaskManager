import type { ProjectInfoDto, TaskResponse, User, NewTaskData } from '../../types';
import { CreateTaskModal, EditTaskModal, ViewTaskModal } from '../TaskModals/TaskModals';
import { MultiTreeGraph } from '../TreeGraph/MultiTreeGraph';
import { areAllChildrenCompleted, flattenTasks } from '../../utils/taskTreeUtils';
import { UpdateTaskModal } from '../Modals/UpdateTaskModal.tsx';

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
    isRootTask: (task: TaskResponse | null) => boolean; // Изменяем тип на функцию
    updatingTask: TaskResponse | null;
    onUpdatingTaskChange: (task: TaskResponse | null) => void;
    onTaskUpdate: (updatedTask: TaskResponse) => void;
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
                               isRootTask, // Теперь это функция
                               updatingTask,
                               onUpdatingTaskChange,
                               onTaskUpdate
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
                    {/* 1. Модалка обновления задачи */}
                    {updatingTask && selectedProject && (
                        <UpdateTaskModal
                            task={updatingTask}
                            projectId={selectedProject.id}
                            teamUsers={selectedProject.team.users}
                            availableParents={availableParents.filter(t => t.id !== updatingTask.id)}
                            isRootTask={isRootTask(updatingTask)} // Теперь работает
                            onUpdate={onTaskUpdate}
                            onCancel={() => onUpdatingTaskChange(null)}
                            currentUser={currentUser}
                        />
                    )}

                    {/* 2. Остальные модалки */}
                    {!updatingTask && editingTask ? (
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
                                isRootTask={isRootTask(editingTask)} // Теперь работает
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
                                onTaskDeleted={(taskId) => {
                                    onDeleteTask(taskId, false);
                                }}
                                onShowUpdateTask={onUpdatingTaskChange}
                                currentUser={currentUser}
                                isRootTask={isRootTask(editingTask)} // Теперь работает
                                areAllChildrenCompleted={checkAllChildrenCompleted(editingTask)}
                            />
                        )
                    ) : !updatingTask && showCreateTask ? (
                        <CreateTaskModal
                            newTask={newTask}
                            onNewTaskChange={onNewTaskChange}
                            onCreateTask={onCreateTask}
                            onCancel={onCancelCreateTask}
                            teamUsers={selectedProject.team.users}
                            availableParents={availableParents}
                        />
                    ) : !updatingTask ? (
                        <MultiTreeGraph
                            project={selectedProject}
                            onTaskClick={onEditingTaskChange}
                        />
                    ) : null}
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