const { Log } = require("logging-middleware");

async function errorHandler(err, req, res, _next) {
  const status = Number(err.status) || 500;
  const level = status >= 500 ? "error" : "warn";

  await Log(
    "backend",
    level,
    "handler",
    `${req.method} ${req.originalUrl} failed [${status}]: ${err.message}`
  );

  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : "Bad Request",
    detail: err.message
  });
}

module.exports = errorHandler;