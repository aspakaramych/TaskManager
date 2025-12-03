export interface User {
    username: string,
    email: string,
    firstName: string,
    lastName: string,
    accessToken: string,
    refreshToken: string
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
  title: string;
  description: string;
  tasks: Task[];
  creator: string;
}

export interface NewProjectData {
  title: string;
  description: string;
}

export interface NewTaskData {
  title: string;
  dueDate: string;
  assignee: string;
  parentId: number | 'root' | null;
}