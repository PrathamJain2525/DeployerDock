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
  const {
    PROJECT_ID,
    GIT_REPOSITORY_URL,
    BASE_DIR,
    INSTALL_COMMAND,
    BUILD_COMMAND,
    BUILD_FOLDER_NAME,
    CREATED_AT,
    LAST_DEPLOY,
    STATUS,
  } = await req.json();
  if (!GIT_REPOSITORY_URL) {
    return Response.json(
      { success: false, error: "Git repository URL is required" },
      { status: 400 }
    );
  }

  const project: projectType = {
    PROJECT_ID,
    GIT_REPOSITORY_URL,
    BASE_DIR,
    INSTALL_COMMAND,
    BUILD_COMMAND,
    BUILD_FOLDER_NAME,
    CREATED_AT,
    LAST_DEPLOY,
    STATUS,
  };

  const client = await clerkClient();

  const response = await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      projects: {
        ...(((
          await client.users.getUser(userId)
        ).publicMetadata.projects as projectType[]) || {}),
        [PROJECT_ID]: project,
      },
    },
  });
  if (!response) {
    return Response.json(
      { success: false, error: "Failed to add project" },
      { status: 500 }
    );
  }
  return Response.json({ success: true });
}
