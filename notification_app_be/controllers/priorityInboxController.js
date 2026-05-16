const { Log } = require("logging-middleware");
const { fetchNotifications } = require("../services/notificationsServices");
const { PriorityInbox, TYPE_WEIGHTS } = require("../services/priorityInbox");

async function getPriorityInbox(req, res) {
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isFinite(limit) || limit < 0) {
    await Log("backend", "warn", "controller", `priorityInbox: bad limit=${req.query.limit}`);
    const e = new Error("limit must be a non-negative number");
    e.status = 400;
    throw e;
  }

  await Log("backend", "info", "controller", `priorityInbox build start, limit=${limit}`);
  const notifications = await fetchNotifications();

  const inbox = new PriorityInbox();
  for (const n of notifications) inbox.push(n);

  const top = inbox.topN(limit);
  await Log(
    "backend",
    "info",
    "controller",
    `priorityInbox build done: ingested=${notifications.length} returned=${top.length}`
  );

  res.json({
    priorityOrder: ["Placement", "Result", "Event"],
    typeWeights: TYPE_WEIGHTS,
    totalIngested: notifications.length,
    returned: top.length,
    items: top
  });
}

module.exports = { getPriorityInbox };