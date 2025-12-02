export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignee: string;
  isCompleted: boolean;
  parentId: number | 'root' | null;
  childrenIds: number[];
}

export interface Project {
  id: number;
  name: string;
  participants: string[];
  tasks: Task[];
  creator: string;
}

export interface NewProjectData {
  name: string;
  participants: string[];
}

export interface NewTaskData {
  title: string;
  dueDate: string;
  assignee: string;
  parentId: number | 'root' | null;
}