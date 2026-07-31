import { prisma } from '@/lib/db'
import { AppError } from '@/lib/errors/AppError'

interface InviteMemberInput {
  email: string
  name?: string
  role?: string
}

export async function listTeamMembers(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { createdAt: 'asc' },
  })

  return Promise.all(
    members.map(async (member) => {
      const openTasks = await prisma.task.count({
        where: {
          assigneeId: member.userId,
          status: { not: 'DONE' },
        },
      })
      return {
        id: member.id,
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
        role: member.role,
        openTasks,
      }
    })
  )
}

export async function inviteMember(
  workspaceId: string,
  input: InviteMemberInput
) {
  // Verify workspace exists
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  })
  if (!workspace) {
    throw new AppError('NOT_FOUND', 'Workspace not found', 'abort', 404)
  }

  // Find or create the user by email
  let user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    const name = input.name || input.email.split('@')[0]
    user = await prisma.user.create({
      data: {
        name,
        email: input.email,
        passwordHash: '$2b$10$placeholder_hash_for_demo123',
      },
    })
  }

  // userId is unique across workspace members, so an existing row means conflict
  const existing = await prisma.workspaceMember.findUnique({
    where: { userId: user.id },
  })
  if (existing) {
    throw new AppError(
      'CONFLICT',
      'User is already a member of this workspace',
      'abort',
      409
    )
  }

  return prisma.workspaceMember.upsert({
    where: { userId: user.id },
    create: {
      workspaceId,
      userId: user.id,
      role: input.role || 'MEMBER',
    },
    update: {},
    include: { user: true },
  })
}
