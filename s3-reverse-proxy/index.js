import express from "express";
import httpProxy from "http-proxy";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const proxy = httpProxy.createProxyServer();
const BasePath = process.env.BasePathURL;

app.use((req, res) => {
  // FUTURE TASK: DATABASE INTEGRATION
  const hostName = req.hostname;

  const subdomain = hostName.split(".")[0];
  // FUTURE TASK: CUSTOM DOMAIN SUPPORT

  const resolvesTo = `${BasePath}/${subdomain}`;
  proxy.web(req, res, { target: resolvesTo, changeOrigin: true });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
