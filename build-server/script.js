import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { fileURLToPath } from "url";
import redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const redisServiceUri = process.env.REDIS_SERVICE_URI;
if (!redisServiceUri) {
  console.error("REDIS_SERVICE_URI is not set.");
  process.exit(1);
}

const publisher = new redis(redisServiceUri);

function publishLog(log) {
  publisher.publish(`build_logs:${PROJECT_ID}`, JSON.stringify(log));
}

const PROJECT_ID = process.env.PROJECT_ID;
if (!PROJECT_ID) {
  console.error("PROJECT_ID is not set.");
  process.exit(1);
}

// BASE_DIR is the directory where the code is located inside the cloned repository.
// It is used to navigate to the correct path for building the project.
const BASE_DIR = process.env.BASE_DIR || "";

async function init() {
  publishLog("Build started for project: " + PROJECT_ID);
  const repoPath = path.join(__dirname, "output", BASE_DIR); // where we cloned the repo
  
  // Check if the output directory exists
  if (!fs.existsSync(repoPath)) {
    console.error(`Output directory does not exist: ${repoPath}`);
    publishLog("Output directory does not exist: " + repoPath);
    process.exit(1);
  }

  const buildCommand = process.env.BUILD_COMMAND || "npm run build";
  const installCommand = process.env.INSTALL_COMMAND || "npm install"; // add any manual command in future (if you want to) - maybe add serverless-http

  const proc = exec(`cd ${repoPath} && ${installCommand} && ${buildCommand}`);
  proc.stdout.on("data", function (data) {
    console.log(data.toString());
    publishLog(data.toString());
  });

  proc.stdout.on("error", function (data) {
    console.log("Error", data.toString());
    publishLog("Error: " + data.toString());
  });

  const buildFolderName = process.env.BUILD_FOLDER_NAME || "dist";
  proc.on("close", async function () {
    console.log("Build Complete");
    publishLog("Build completed for project: " + PROJECT_ID);
    const distFolderPath = path.join(__dirname, "output", buildFolderName);
    if (!fs.existsSync(distFolderPath)) {
      console.error(`Build folder does not exist: ${distFolderPath}`);
      publishLog("Build folder does not exist: " + buildFolderName);
      process.exit(1);
    }
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    console.log("Uploading files to S3...");
    publishLog("Uploading files to S3 for project: " + PROJECT_ID);

    for (const filePath of distFolderContents) {
      console.log("Uploading file:", filePath);
      publishLog("Uploading file: " + filePath + " for project: " + PROJECT_ID);
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
      publishLog(`Uploaded ${filePath} to S3 for project: ${PROJECT_ID}`);
    }
    console.log("DONE");
    publishLog("All files uploaded to S3 for project: " + PROJECT_ID);
    publisher.disconnect();
    console.log("Redis publisher disconnected.");
  });
}

init();
