import { projectType } from "@/types/project";
import { auth, clerkClient, User } from "@clerk/nextjs/server";

// Update project details

export async function PUT(req: Request) {
  await auth.protect();
  const { userId } = await auth();
  if (!userId) {
    return Response.json(
      { success: false, error: "User not authenticated" },
      { status: 401 }
    );
  }
  const {
    project: {
      PROJECT_ID,
      GIT_REPOSITORY_URL,
      BASE_DIR,
      INSTALL_COMMAND,
      BUILD_COMMAND,
      BUILD_FOLDER_NAME,
      LAST_DEPLOY,
      STATUS,
    },
  } = await req.json();
  if (!PROJECT_ID) {
    return Response.json(
      { success: false, error: "Project ID is required" },
      { status: 400 }
    );
  }

  const client = await clerkClient();
  const user: User = await client.users.getUser(userId);
  const currentProjects = Array.isArray(user.publicMetadata.projects)
    ? (user.publicMetadata.projects as projectType[])
    : [];
  if (!currentProjects) {
    return Response.json(
      { success: false, error: "Project not found with ID: " + PROJECT_ID },
      { status: 404 }
    );
  }
  const existingProject =
    currentProjects.find((project) => project.PROJECT_ID === PROJECT_ID) || {};
  const updatedProjects = {
    ...currentProjects,
    [PROJECT_ID]: {
      ...existingProject,
      ...(GIT_REPOSITORY_URL !== undefined ? { GIT_REPOSITORY_URL } : {}),
      ...(BASE_DIR !== undefined ? { BASE_DIR } : {}),
      ...(INSTALL_COMMAND !== undefined ? { INSTALL_COMMAND } : {}),
      ...(BUILD_COMMAND !== undefined ? { BUILD_COMMAND } : {}),
      ...(BUILD_FOLDER_NAME !== undefined ? { BUILD_FOLDER_NAME } : {}),
      ...(LAST_DEPLOY !== undefined ? { LAST_DEPLOY } : {}),
      ...(STATUS !== undefined ? { STATUS } : {}),
    },
  };
  const response = await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      projects: updatedProjects,
    },
  });
  if (!response) {
    return Response.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
  return Response.json({ success: true });
}
