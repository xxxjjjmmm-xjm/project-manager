import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete existing data in reverse dependency order
  await prisma.taskTag.deleteMany()
  await prisma.projectTag.deleteMany()
  await prisma.scanRecord.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.asset.deleteMany()
  await prisma.task.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.scanPath.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.project.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  console.log('Cleared existing data.')

  // ── Create User ──
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@projecthub.dev',
      passwordHash: '$2b$10$placeholder_hash_for_demo123',
    },
  })
  console.log(`  User: ${user.name} (${user.email})`)

  // ── Create Workspace ──
  const workspace = await prisma.workspace.create({
    data: {
      name: 'My Workspace',
      ownerId: user.id,
    },
  })
  console.log(`  Workspace: ${workspace.name}`)

  // ── Create WorkspaceMember ──
  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  })
  console.log(`  WorkspaceMember: ${user.name} as OWNER`)

  // ── Create Projects ──
  const project1 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerId: user.id,
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern design',
      type: 'web',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      progress: 75,
      path: '/projects/website-redesign',
      dueDate: new Date('2026-08-20'),
    },
  })

  const project2 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerId: user.id,
      name: 'Mobile App',
      description: 'Cross-platform mobile application for iOS and Android',
      type: 'mobile',
      status: 'PLANNING',
      priority: 'MEDIUM',
      progress: 10,
      path: '/projects/mobile-app',
      dueDate: new Date('2026-09-15'),
    },
  })

  const project3 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerId: user.id,
      name: 'Internal Tools',
      description: 'Admin dashboard and internal tooling for the team',
      type: 'tool',
      status: 'COMPLETED',
      priority: 'LOW',
      progress: 100,
      path: '/projects/internal-tools',
      dueDate: new Date('2026-07-30'),
    },
  })

  console.log(`  Projects: ${project1.name}, ${project2.name}, ${project3.name}`)

  // ── Create Tasks ──
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Design mockups',
      description: 'Create high-fidelity mockups for all key pages',
      status: 'TODO',
      priority: 'HIGH',
      creatorId: user.id,
      position: 1,
    },
  })

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      title: 'Frontend implementation',
      description: 'Implement the frontend based on approved mockups',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigneeId: user.id,
      creatorId: user.id,
      position: 2,
    },
  })

  const task3 = await prisma.task.create({
    data: {
      projectId: project2.id,
      title: 'API integration',
      description: 'Integrate with backend REST API endpoints',
      status: 'TODO',
      priority: 'MEDIUM',
      creatorId: user.id,
      position: 1,
    },
  })

  const task4 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Set up CI/CD',
      description: 'Configure continuous integration and deployment pipeline',
      status: 'DONE',
      priority: 'LOW',
      creatorId: user.id,
      position: 1,
    },
  })

  const task5 = await prisma.task.create({
    data: {
      projectId: project3.id,
      title: 'Write documentation',
      description: 'Write user and developer documentation',
      status: 'REVIEW',
      priority: 'MEDIUM',
      creatorId: user.id,
      position: 2,
    },
  })

  const tasks = [task1, task2, task3, task4, task5]
  console.log(`  Tasks: ${tasks.map((t) => t.title).join(', ')}`)

  // ── Create Activities ──
  await prisma.activity.create({
    data: {
      workspaceId: workspace.id,
      actorId: user.id,
      action: 'project_created',
      targetType: 'project',
      targetId: project1.id,
      metadata: JSON.stringify({ projectName: project1.name }),
    },
  })

  await prisma.activity.create({
    data: {
      workspaceId: workspace.id,
      actorId: user.id,
      action: 'project_created',
      targetType: 'project',
      targetId: project2.id,
      metadata: JSON.stringify({ projectName: project2.name }),
    },
  })

  await prisma.activity.create({
    data: {
      workspaceId: workspace.id,
      actorId: user.id,
      action: 'project_created',
      targetType: 'project',
      targetId: project3.id,
      metadata: JSON.stringify({ projectName: project3.name }),
    },
  })

  console.log('  Activities: 3 project_created entries')

  // ── Create Tags ──
  const tag1 = await prisma.tag.create({
    data: {
      name: 'frontend',
      color: '#3B82F6',
    },
  })

  const tag2 = await prisma.tag.create({
    data: {
      name: 'backend',
      color: '#8B5CF6',
    },
  })

  console.log(`  Tags: ${tag1.name}, ${tag2.name}`)

  // ── Summary ──
  console.log('\nSeed complete!')
  console.log('Created: 1 user, 1 workspace, 3 projects, 5 tasks, 3 activities, 2 tags')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
