import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";
import http from "http";

dotenv.config();

const PORT = parseInt(process.env.PORT || "9000", 10);

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const pubClient = createClient({
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
subClient.on("error", (err) => console.error("Redis Sub Error:", err));

await pubClient.connect();
await subClient.connect();

io.adapter(createAdapter(pubClient, subClient));

io.on("connection", (socket) => {
  socket.emit("message", "Connected to the socket");

  socket.on("Subscribe", (channel) => {
    socket.join(channel);
    socket.emit("message", `Joined ${channel}`);
  });
});

await subClient.pSubscribe("build_logs:*", (message, channel) => {
  io.to(channel).emit("message", message);
});

app.get("/", (req, res) => {
  res.send("Logs server running");
});

server.listen(PORT, () => {
  console.log(`Logs server running on port ${PORT}`);
});