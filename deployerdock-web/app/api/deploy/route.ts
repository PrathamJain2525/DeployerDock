import { NextRequest, NextResponse } from "next/server";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { generateSlug } from "random-word-slugs";

if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.AWS_CLUSTER_ARN ||
  !process.env.AWS_ECS_TASK_ARN ||
  !process.env.AWS_REGION ||
  !process.env.AWS_SUBNET_A ||
  !process.env.AWS_SUBNET_B ||
  !process.env.AWS_SUBNET_C ||
  !process.env.AWS_SECURITY_GROUP ||
  !process.env.AWS_CONTAINER_IMAGE_NAME
) {
  console.error("Missing required AWS environment variables.");
  process.exit(1);
}

const config = {
  CLUSTER: process.env.AWS_CLUSTER_ARN!,
  TASK: process.env.AWS_ECS_TASK_ARN!,
};

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const GIT_REPOSITORY_URL = body?.GIT_REPOSITORY_URL;
    if (!GIT_REPOSITORY_URL) {
      return NextResponse.json(
        { error: "GIT_REPOSITORY_URL is required" },
        { status: 400 }
      );
    }

    const slug = body.PROJECT_ID || generateSlug();
    const BASE_DIR = body.BASE_DIR || "";
    const BUILD_COMMAND = body.BUILD_COMMAND || "";
    const INSTALL_COMMAND = body.INSTALL_COMMAND || "";
    const BUILD_FOLDER_NAME = body.BUILD_FOLDER_NAME || "";

    const command = new RunTaskCommand({
      cluster: config.CLUSTER,
      taskDefinition: config.TASK,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: [
            process.env.AWS_SUBNET_A!,
            process.env.AWS_SUBNET_B!,
            process.env.AWS_SUBNET_C!,
          ],
          securityGroups: [process.env.AWS_SECURITY_GROUP!],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: process.env.AWS_CONTAINER_IMAGE_NAME!,
            environment: [
              { name: "GIT_REPOSITORY_URL", value: GIT_REPOSITORY_URL },
              { name: "PROJECT_ID", value: slug },
              { name: "BASE_DIR", value: BASE_DIR },
              { name: "BUILD_COMMAND", value: BUILD_COMMAND },
              { name: "INSTALL_COMMAND", value: INSTALL_COMMAND },
              { name: "BUILD_FOLDER_NAME", value: BUILD_FOLDER_NAME },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);

    return NextResponse.json({
      status: "queued",
      data: {
        id: slug,
      },
    });
  } catch (error: any) {
    console.error("ECS task run error:", error);
    return NextResponse.json(
      { error: "Failed to run ECS task" },
      { status: 500 }
    );
  }
}
