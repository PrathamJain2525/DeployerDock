import express from "express";
import dotenv from "dotenv";
import { generateSlug } from "random-word-slugs";
import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import { Server } from "socket.io";
import redis from "ioredis";
dotenv.config();
const PORT = parseInt(process.env.PORT, 10) || 9000;
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

const redisServiceUri = process.env.REDIS_SERVICE_URI;

const subscriber = new redis(redisServiceUri);

const io = new Server({ cors: "*" });

const SOCKET_PORT = process.env.SOCKET_PORT || PORT + 1;

io.listen(SOCKET_PORT, () => {
  console.log(`Socket.io server is running on port ${SOCKET_PORT}`);
});

io.on("connection", (socket) => {
  socket.emit("message", "Connected to the socket");
  socket.on("Subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
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

async function initRedis() {
  console.log("Subscribed to logs...");
  subscriber.psubscribe("build_logs:*");
  subscriber.on("pmessage", (pattern, channel, message) => {
    io.to(channel).emit("message", message);
  });
}

initRedis();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
