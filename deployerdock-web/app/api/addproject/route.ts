import { auth, clerkClient } from "@clerk/nextjs/server";
import { projectType } from "@/types/project";

export async function POST(req: Request) {
  await auth.protect();

  const { userId } = await auth();

  if (!userId) {
    return Response.json(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }

  const body = await req.json();

  const PROJECT_ID = String(body.PROJECT_ID || "").trim();
  const GIT_REPOSITORY_URL = String(body.GIT_REPOSITORY_URL || "").trim();

  if (!PROJECT_ID) {
    return Response.json(
      { success: false, error: "Project ID is required" },
      { status: 400 }
    );
  }

  if (!GIT_REPOSITORY_URL) {
    return Response.json(
      { success: false, error: "Git repository URL is required" },
      { status: 400 }
    );
  }

  const project: projectType = {
    PROJECT_ID,
    GIT_REPOSITORY_URL,
    BASE_DIR: String(body.BASE_DIR || "").trim(),
    INSTALL_COMMAND: String(body.INSTALL_COMMAND || "npm install").trim(),
    BUILD_COMMAND: String(body.BUILD_COMMAND || "npm run build").trim(),
    BUILD_FOLDER_NAME: String(body.BUILD_FOLDER_NAME || "dist").trim(),
    CREATED_AT: body.CREATED_AT || new Date().toISOString(),
    LAST_DEPLOY: body.LAST_DEPLOY || new Date().toISOString(),
    STATUS: body.STATUS || "Building",
  };

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const existingProjects =
    (user.publicMetadata.projects as Record<string, projectType>) || {};

  const response = await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      projects: {
        ...existingProjects,
        [PROJECT_ID]: project,
      },
    },
  });

  return Response.json({
    success: true,
    project: response.publicMetadata.projects,
  });
}