import express from "express";
import dotenv from "dotenv";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";

dotenv.config();
const PORT = process.env.PORT || 9000;
const app = express();
app.use(express.json());

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("AWS credentials are not set in environment variables.");
  process.exit(1);
}

const config = {
  CLUSTER: process.env.AWS_CLUSTER_ARN,
  TASK: process.env.AWS_ECS_TASK_ARN,
};
const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/api", async (req, res) => {
  console.log(req.body);
  const gitURL = req.body?.gitURL;
  if (!gitURL) {
    return res.status(400).json({ error: "Git URL is required" });
  }
  const slug = generateSlug();

  const command = new RunTaskCommand({
    cluster: config.CLUSTER,
    taskDefinition: config.TASK,
    launchType: process.env.AWS_LAUNCH_TYPE || "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: [
          process.env.AWS_SUBNET_A,
          process.env.AWS_SUBNET_B,
          process.env.AWS_SUBNET_C,
        ],
        securityGroups: [process.env.AWS_SECURITY_GROUP],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: process.env.AWS_CONTAINER_IMAGE_NAME,
          environment: [
            {
              name: "GIT_REPOSITORY_URL",
              value: gitURL,
            },
            {
              name: "PROJECT_ID",
              value: slug,
            },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  return res.json({
    status: "queued",
    data: {
      id: slug,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
