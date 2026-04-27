import { NextRequest, NextResponse } from "next/server";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { generateSlug } from "random-word-slugs";

const requiredEnv = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AWS_CLUSTER_ARN",
  "AWS_ECS_TASK_ARN",
  "AWS_REGION",
  "AWS_SUBNET_A",
  "AWS_SUBNET_B",
  "AWS_SUBNET_C",
  "AWS_SECURITY_GROUP",
  "AWS_CONTAINER_IMAGE_NAME",
  "REDIS_HOST",
  "REDIS_PORT",
  "REDIS_USERNAME",
  "REDIS_PASSWORD",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

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
    if (missingEnv.length > 0) {
      console.error("Missing environment variables:", missingEnv);
      return NextResponse.json(
        {
          error: "Missing required environment variables",
          missing: missingEnv,
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const GIT_REPOSITORY_URL = String(body?.GIT_REPOSITORY_URL || "").trim();

    if (!GIT_REPOSITORY_URL) {
      return NextResponse.json(
        { error: "GIT_REPOSITORY_URL is required" },
        { status: 400 }
      );
    }

    const slug = String(body.PROJECT_ID || generateSlug()).trim();
    const BASE_DIR = String(body.BASE_DIR || "").trim();
    const BUILD_COMMAND = String(body.BUILD_COMMAND || "npm run build").trim();
    const INSTALL_COMMAND = String(body.INSTALL_COMMAND || "npm install").trim();
    const BUILD_FOLDER_NAME = String(body.BUILD_FOLDER_NAME || "dist").trim();

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

              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID!,
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY!,
              },

              { name: "REDIS_HOST", value: process.env.REDIS_HOST! },
              { name: "REDIS_PORT", value: process.env.REDIS_PORT! },
              { name: "REDIS_USERNAME", value: process.env.REDIS_USERNAME! },
              { name: "REDIS_PASSWORD", value: process.env.REDIS_PASSWORD! },
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
      {
        error: "Failed to run ECS task",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}