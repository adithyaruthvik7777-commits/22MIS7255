const { Log } = require("logging-middleware");
const { client } = require("../utils/apiClient");

function normaliseNotification(n) {
  return {
    id: n.ID ?? n.id,
    type: n.Type ?? n.type,
    message: n.Message ?? n.message,
    timestamp: n.Timestamp ?? n.timestamp
  };
}

async function fetchNotifications() {
  await Log("backend", "info", "service", "notificationsService.fetchNotifications start");
  const { data } = await client.get("/notifications");
  const list = Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data)
      ? data
      : [];
  const normalised = list.map(normaliseNotification).filter((n) => n.id && n.type);
  await Log(
    "backend",
    "info",
    "service",
    `notificationsService.fetchNotifications got ${normalised.length} notifications`
  );
  return normalised;
}

module.exports = { fetchNotifications };