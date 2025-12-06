import { TaskResponse, TaskProgress } from '../types';

// Helper to get all children recursively
export const getAllDescendants = (taskId: string, tasks: TaskResponse[]): string[] => {
  const descendants: string[] = [];
  const stack = [taskId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const currentTask = tasks.find(t => t.id === currentId);

    if (currentTask && currentTask.children) {
      const childIds = currentTask.children.map(c => c.id);
      descendants.push(...childIds);
      stack.push(...childIds);
    }
  }

  return [...new Set(descendants)];
};

export const canSetParent = (
  taskId: string,
  newParentId: string | null,
  tasks: TaskResponse[]
): boolean => {
  if (newParentId === null) return true;
  if (taskId === newParentId) return false;

  const descendants = getAllDescendants(taskId, tasks);
  return !descendants.includes(newParentId);
};

export const getAvailableParents = (taskId: string, tasks: TaskResponse[]): TaskResponse[] => {
  const descendants = getAllDescendants(taskId, tasks);
  const excludedIds = [taskId, ...descendants];

  return tasks.filter(task => !excludedIds.includes(task.id));
};

export const areAllChildrenCompleted = (taskId: string, tasks: TaskResponse[]): boolean => {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.children || task.children.length === 0) return true;

  return task.children.every(child => child.progress === TaskProgress.Done);
};

// Helper to flatten task tree
export const flattenTasks = (tasks: TaskResponse[]): TaskResponse[] => {
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

// Helper to find task by id in tree structure
export const findTaskById = (taskId: string, tasks: TaskResponse[]): TaskResponse | null => {
  for (const task of tasks) {
    if (task.id === taskId) return task;
    if (task.children && task.children.length > 0) {
      const found = findTaskById(taskId, task.children);
      if (found) return found;
    }
  }
  return null;
};

// Helper to get root level tasks (tasks without parent)
export const getRootTasks = (tasks: TaskResponse[]): TaskResponse[] => {
  return tasks.filter(task => task.taskHeadId === null);
};

// Helper to check if task is done
export const isTaskDone = (task: TaskResponse): boolean => {
  return task.progress === TaskProgress.Done;
};

// Helper to check if task is taken
export const isTaskTaken = (task: TaskResponse): boolean => {
  return task.progress === TaskProgress.Taken;
};

// Helper to check if task is canceled
export const isTaskCanceled = (task: TaskResponse): boolean => {
  return task.progress === TaskProgress.Canceled;
};

// Helper to format deadline
export const formatDeadline = (deadline: Date): string => {
  const date = new Date(deadline);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};