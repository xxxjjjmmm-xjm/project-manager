-- A user may join multiple workspaces — drop the global unique on userId
DROP INDEX "WorkspaceMember_userId_key";

-- A user may join a workspace only once — composite unique instead
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");
