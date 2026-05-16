require("dotenv").config();

const express = require("express");
const { Log, requestLogger } = require("logging-middleware");

const { buildConfig } = require("./config");
const apiRouter = require("./routes");
const errorHandler = require("./middleware/errorHandler");

const cfg = buildConfig();
const app = express();

app.use(express.json());
app.use(requestLogger("backend", "middleware"));

app.get("/health", async (req, res) => {
  await Log("backend", "info", "route", "notification_app_be health check served");
  res.json({ status: "ok", service: "notification_app_be" });
});

app.use("/api", apiRouter);

app.use(async (req, res) => {
  await Log("backend", "warn", "route", `404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: "Not Found" });
});

app.use(errorHandler);

app.listen(cfg.port, async () => {
  if (cfg.missingRequired.length > 0) {
    await Log(
      "backend",
      "warn",
      "config",
      `Boot with missing env vars: ${cfg.missingRequired.join(", ")} — auth-protected calls will fail until set`
    );
  }
  await Log(
    "backend",
    "info",
    "service",
    `notification_app_be listening on port ${cfg.port}`
  );
  process.stdout.write(`notification_app_be ready on http://localhost:${cfg.port}\n`);
});