import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";

dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 9000;
const SOCKET_PORT = process.env.SOCKET_PORT || PORT + 1 || 9001;
const app = express();
app.use(cors());
app.use(express.json());

// Socket.io setup
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
const REDIS_USERNAME = process.env.REDIS_USERNAME || "default";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

if (!REDIS_HOST || !REDIS_PASSWORD) {
  console.error("Redis credentials are not set properly in env.");
}

let io = null;
let subscriber = null;

const pubClient = createClient({
  username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  socket: { host: REDIS_HOST, port: REDIS_PORT },
});

subscriber = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
subscriber.on("error", (err) => console.error("Redis Sub Error:", err));

await pubClient.connect();
await subscriber.connect();

io = new Server({ cors: { origin: "*" } });
io.listen(SOCKET_PORT, () => {
  console.log(`Socket.io server is running on port ${SOCKET_PORT}`);
});

io.adapter(createAdapter(pubClient, subscriber));

io.on("connection", (socket) => {
  socket.emit("message", "Connected to the socket");
  socket.on("Subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

// Listening to `build_logs:*` subsicription requests
await subscriber.pSubscribe("build_logs:*", (message, channel) => {
  io?.to(channel).emit("message", message);
});
