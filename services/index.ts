// Project service
export {
  listProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  deleteProject,
} from './project.service'

// Task service
export {
  listTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTask,
} from './task.service'

// Activity service
export { createActivity, getRecentActivity } from './activity.service'

// File service
export { listFiles, getFile, deleteFile, createFile } from './file.service'

// Team service
export { listTeamMembers, inviteMember } from './team.service'

// Dashboard service
export {
  getDashboardStats,
  getTodayTasks,
  getUpcomingDeadlines,
} from './dashboard.service'

// Calendar service
export { getCalendarEvents } from './calendar.service'
