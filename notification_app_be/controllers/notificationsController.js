const { Log } = require("logging-middleware");
const { fetchNotifications } = require("../services/notificationsServices");

async function listNotifications(req, res) {
  await Log("backend", "info", "controller", "notificationsController.listNotifications");
  const notifications = await fetchNotifications();
  res.json({ notifications, count: notifications.length });
}

module.exports = { listNotifications };