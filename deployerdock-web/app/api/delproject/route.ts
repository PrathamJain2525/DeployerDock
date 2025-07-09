import { projectType } from "@/types/project";
import { clerkClient, auth } from "@clerk/nextjs/server";

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
    project: { id },
  } = await req.json();
  if (!id) {
    return Response.json(
      { success: false, error: "Project ID is required" },
      { status: 400 }
    );
  }
  const client = await clerkClient();

  const response = await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      projects: {
        ...(
          ((
            await client.users.getUser(userId)
          ).publicMetadata.projects as Array<projectType> | undefined) || []
        ).filter((project) => project.id !== id),
      },
    },
  });
  if (!response) {
    return Response.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
  return Response.json({ success: true });
}
