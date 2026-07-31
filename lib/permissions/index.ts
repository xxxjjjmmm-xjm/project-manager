import { prisma } from '@/lib/db'

const EDIT_PROJECT_ROLES = ['OWNER', 'ADMIN', 'MANAGER']
const INVITE_ROLES = ['OWNER', 'ADMIN']
const ASSET_MANAGER_ROLES = ['OWNER', 'ADMIN']

/** Role string of a user within a workspace, or null when not a member. */
export async function getWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<string | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  })
  return member?.role ?? null
}

/** Whether the user can edit/archive/delete a project (OWNER/ADMIN/MANAGER). */
export async function canEditProject(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId)
  return role !== null && EDIT_PROJECT_ROLES.includes(role)
}

/** Whether the user can manage tasks (any workspace member). */
export async function canManageTask(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId)
  return role !== null
}

/** Whether the user can invite members to the workspace (OWNER/ADMIN). */
export async function canInviteMembers(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId)
  return role !== null && INVITE_ROLES.includes(role)
}

/** Whether the user can delete an asset (OWNER/ADMIN, or its uploader). */
export async function canDeleteAsset(
  workspaceId: string,
  userId: string,
  uploadedById?: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId)
  if (role !== null && ASSET_MANAGER_ROLES.includes(role)) return true
  return Boolean(uploadedById) && uploadedById === userId
}
