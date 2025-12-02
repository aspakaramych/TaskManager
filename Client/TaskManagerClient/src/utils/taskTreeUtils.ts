import { Task } from '../types';

export const getAllDescendants = (taskId: number, tasks: Task[]): number[] => {
  const descendants: number[] = [];
  const stack = [taskId];
  
  while (stack.length > 0) {
    const currentId = stack.pop()!;
    const currentTask = tasks.find(t => t.id === currentId);
    
    if (currentTask) {
      descendants.push(...currentTask.childrenIds);
      stack.push(...currentTask.childrenIds);
    }
  }
  
  return [...new Set(descendants)];
};

export const canSetParent = (
  taskId: number, 
  newParentId: number | 'root' | null, 
  tasks: Task[]
): boolean => {
  if (newParentId === null || newParentId === 'root') return true;
  if (taskId === newParentId) return false;
  
  const descendants = getAllDescendants(taskId, tasks);
  return !descendants.includes(newParentId);
};

export const getAvailableParents = (taskId: number, tasks: Task[]): Task[] => {
  const descendants = getAllDescendants(taskId, tasks);
  const excludedIds = [taskId, ...descendants];
  
  return tasks.filter(task => !excludedIds.includes(task.id));
};

export const areAllChildrenCompleted = (taskId: number, tasks: Task[]): boolean => {
  const task = tasks.find(t => t.id === taskId);
  if (!task || task.childrenIds.length === 0) return true;
  
  return task.childrenIds.every(childId => {
    const child = tasks.find(t => t.id === childId);
    return child?.isCompleted;
  });
};

export const updateParentCompletion = (
  taskId: number, 
  tasks: Task[]
): Task[] => {
  const updatedTasks = [...tasks];
  const task = updatedTasks.find(t => t.id === taskId);
  
  if (!task) return updatedTasks;
  
  let currentTask = task;
  while (currentTask.parentId && currentTask.parentId !== 'root') {
    const parent = updatedTasks.find(t => t.id === currentTask.parentId as number);
    if (!parent) break;
    
    const allChildrenCompleted = areAllChildrenCompleted(parent.id, updatedTasks);
    
    if (parent.isCompleted && !allChildrenCompleted) {
      parent.isCompleted = false;
    }
    
    currentTask = parent;
  }
  
  return updatedTasks;
};

export const removeTaskAndProcessChildren = (
  taskId: number,
  tasks: Task[],
  removeChildren: boolean
): Task[] => {
  const taskToRemove = tasks.find(t => t.id === taskId);
  if (!taskToRemove) return tasks;

  let updatedTasks = tasks.filter(t => t.id !== taskId);
  
  if (taskToRemove.parentId && taskToRemove.parentId !== 'root') {
    const parent = updatedTasks.find(t => t.id === taskToRemove.parentId as number);
    if (parent) {
      parent.childrenIds = parent.childrenIds.filter(id => id !== taskId);
    }
  }
  
  if (removeChildren) {
    const childrenToRemove = getAllDescendants(taskId, tasks);
    updatedTasks = updatedTasks.filter(t => !childrenToRemove.includes(t.id));
  } else {
    taskToRemove.childrenIds.forEach(childId => {
      const child = updatedTasks.find(t => t.id === childId);
      if (child) {
        child.parentId = taskToRemove.parentId;
        
        if (child.parentId === 'root') {
          child.parentId = null;
        }
      }
    });
  }
  
  return updatedTasks;
};

export const addChildToParent = (
  childId: number,
  parentId: number | 'root' | null,
  tasks: Task[]
): Task[] => {
  const updatedTasks = [...tasks];
  
  if (parentId && parentId !== 'root') {
    const parent = updatedTasks.find(t => t.id === parentId);
    if (parent && !parent.childrenIds.includes(childId)) {
      parent.childrenIds.push(childId);
    }
  }
  
  return updatedTasks;
};

export const removeChildFromParent = (
  childId: number,
  parentId: number | 'root' | null,
  tasks: Task[]
): Task[] => {
  const updatedTasks = [...tasks];
  
  if (parentId && parentId !== 'root') {
    const parent = updatedTasks.find(t => t.id === parentId);
    if (parent) {
      parent.childrenIds = parent.childrenIds.filter(id => id !== childId);
    }
  }
  
  return updatedTasks;
};