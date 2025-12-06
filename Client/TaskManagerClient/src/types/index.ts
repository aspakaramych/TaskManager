import { TaskResponse, TeamResponse, ProjectInfoDto, TaskProgress, UserInTeamDto } from "../Components/Api/mainApi.ts";

// Re-export API types for convenience
export type { TaskResponse, TeamResponse, ProjectInfoDto, UserInTeamDto };
export { TaskProgress };

export interface User {
  username: string,
  email: string,
  firstName: string,
  lastName: string,
  accessToken: string,
  refreshToken: string
}

export interface NewProjectData {
  title: string;
  description: string;
}

export interface NewTaskData {
  title: string;
  deadline: Date;
  assigneeId: string | null;
  taskHeadId: string | null;
}