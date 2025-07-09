import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { fileURLToPath } from "url";
import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const PROJECT_ID = process.env.PROJECT_ID;

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

if (!REDIS_HOST || !REDIS_PASSWORD) {
  console.error("Redis credentials are not set properly in env.");
}

let publisher = null;

async function initRedisPublisher() {
  const client = createClient({
    username: REDIS_USERNAME,
    password: REDIS_PASSWORD,
    socket: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  });

  client.on("error", (err) => {
    console.error("Redis Publisher Error:", err);
  });

  try {
    await client.connect();
    console.log("Connected to Redis (Publisher)");
    publisher = client;
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
}

async function publishLog(log) {
  if (publisher) {
    await publisher.publish(`build_logs:${PROJECT_ID}`, JSON.stringify(log));
  } else {
    console.log(log);
    console.error("Redis publisher is not initialized. Cannot publish log.");
  }
}

await initRedisPublisher();

if (!PROJECT_ID) {
  console.error("PROJECT_ID is not set.");
  process.exit(1);
}

// BASE_DIR is the directory where the code is located inside the cloned repository.
// It is used to navigate to the correct path for building the project.
const BASE_DIR = process.env.BASE_DIR || "";

async function init() {
  await publishLog("Build started for project: " + PROJECT_ID);
  const repoPath = path.join(__dirname, "output", BASE_DIR); // where we cloned the repo

  // Check if the output directory exists
  if (!fs.existsSync(repoPath)) {
    console.error(`Output directory does not exist: ${repoPath}`);
    await publishLog("ERROR: Output directory does not exist " + repoPath);
    process.exit(1);
  }

  const buildCommand = process.env.BUILD_COMMAND || "npm run build";
  const installCommand = process.env.INSTALL_COMMAND || "npm install"; // add any manual command in future (if you want to) - maybe add serverless-http

  const proc = exec(`cd ${repoPath} && ${installCommand} && ${buildCommand}`);
  proc.stdout.on("data", async function (data) {
    console.log(data.toString());
    await publishLog(data.toString());
  });

  proc.stdout.on("error", async function (data) {
    console.log("Error", data.toString());
    await publishLog("ERROR: " + data.toString());
  });

  const buildFolderName = process.env.BUILD_FOLDER_NAME || "dist";
  proc.on("close", async function () {
    console.log("Build Complete");
    await publishLog("Build completed for project: " + PROJECT_ID);
    const distFolderPath = path.join(__dirname, "output", buildFolderName);
    if (!fs.existsSync(distFolderPath)) {
      console.error(`Build folder does not exist: ${distFolderPath}`);
      await publishLog("Build folder does not exist: " + buildFolderName);
      process.exit(1);
    }
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    console.log("Uploading files to S3...");
    await publishLog("Uploading files to S3 for project: " + PROJECT_ID);

    for (const filePath of distFolderContents) {
      console.log("Uploading file:", filePath);
      await publishLog(
        "Uploading file: " + filePath + " for project: " + PROJECT_ID
      );
      const fullFilePath = path.join(distFolderPath, filePath);
      if (fs.lstatSync(fullFilePath).isDirectory()) continue;

      const command = new PutObjectCommand({
        Bucket: "kodo-hashira-universal-bucket",
        Key: `__output/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(fullFilePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);
      console.log(`Uploaded ${filePath} to S3`);
      await publishLog(`Uploaded ${filePath} to S3 for project: ${PROJECT_ID}`);
    }
    console.log("DONE");
    await publishLog("Completed the build for project: " + PROJECT_ID);
    publisher.disconnect();
    console.log("Redis publisher disconnected.");
  });
}

init();
