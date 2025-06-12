import { exec } from "child_process";
import path from "path";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";
import { fileURLToPath } from "url";
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

const PROJECT_ID = process.env.PROJECT_ID;
if (!PROJECT_ID) {
  console.error("PROJECT_ID is not set.");
  process.exit(1);
}

// BASE_DIR is the directory where the code is located inside the cloned repository.
// It is used to navigate to the correct path for building the project.
const BASE_DIR = process.env.BASE_DIR || "";

async function init() {
  const repoPath = path.join(__dirname, "output", BASE_DIR); // where we cloned the repo
  const buildCommand = process.env.BUILD_COMMAND || "npm run build";
  const installCommand = process.env.INSTALL_COMMAND || "npm install"; // add any manual command in future (if you want to) - maybe add serverless-http

  const proc = exec(`cd ${repoPath} && ${installCommand} && ${buildCommand}`);
  proc.stdout.on("data", function (data) {
    // BACKLOG : capture the logs
    console.log(data.toString()); // BACKLOG :use fast db and stream them to user
  });

  proc.stdout.on("error", function (data) {
    console.log("Error", data.toString());
  });

  const buildFolderName = process.env.BUILD_FOLDER_NAME || "dist";
  proc.on("close", async function () {
    console.log("Build Complete");
    const distFolderPath = path.join(__dirname, "output", buildFolderName);
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    for (const filePath of distFolderContents) {
      const fullFilePath = path.join(distFolderPath, filePath);
      if (fs.lstatSync(fullFilePath).isDirectory()) continue;

      const command = new PutObjectCommand({
        Bucket: "kodo-hashira-universal-bucket",
        Key: `__output/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(fullFilePath),
        ContentType: mime.lookup(filePath),
      });

      await s3Client.send(command);
      console.log("DONE");
    }
  });
}

init();
