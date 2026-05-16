function buildLogEntry(app, level, component, message, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    app,
    level,
    component,
    message,
  };

  if (details !== undefined) {
    entry.details = details;
  }

  return entry;
}

async function Log(app, level, component, message, details) {
  const entry = buildLogEntry(app, level, component, message, details);
  console.log(JSON.stringify(entry));
}

function requestLogger(app, component) {
  return function requestLoggerMiddleware(req, res, next) {
    const start = Date.now();

    res.on("finish", () => {
      Log(
        app,
        "info",
        component,
        `${req.method} ${req.originalUrl}`,
        {
          statusCode: res.statusCode,
          durationMs: Date.now() - start,
          ip: req.ip,
        }
      ).catch(() => {});
    });

    next();
  };
}

module.exports = {
  Log,
  requestLogger,
};
