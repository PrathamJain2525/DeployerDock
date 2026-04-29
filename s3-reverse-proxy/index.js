import express from "express";
import httpProxy from "http-proxy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const proxy = httpProxy.createProxyServer();

const BasePath = process.env.BasePathURL;

app.use("/:projectId", (req, res) => {
  const projectId = req.params.projectId;
  const resolvesTo = `${BasePath}/__output/${projectId}`;

  if (req.url === "/") {
    req.url = "/index.html";
  }

  proxy.web(req, res, {
    target: resolvesTo,
    changeOrigin: true,
  });
});

app.get("/", (req, res) => {
  res.send("S3 reverse proxy running");
});

proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err.message);
  res.status(500).send("Proxy error");
});

app.listen(PORT, () => {
  console.log(`Reverse proxy running on port ${PORT}`);
});