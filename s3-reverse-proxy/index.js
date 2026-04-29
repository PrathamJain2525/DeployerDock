import express from "express";
import httpProxy from "http-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const proxy = httpProxy.createProxyServer();

const BasePath = process.env.BasePathURL;

app.get("/", (req, res) => {
  res.send("S3 reverse proxy running");
});

app.use("/:projectId", (req, res) => {
  const projectId = req.params.projectId;

  if (req.url === "/") {
    req.url = "/index.html";
  }

  const resolvesTo = `${BasePath}/__output/${projectId}`;

  proxy.web(req, res, {
    target: resolvesTo,
    changeOrigin: true,
  });
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  res.status(500).send("Proxy error");
});

app.listen(PORT, () => {
  console.log(`Reverse proxy running on port ${PORT}`);
});