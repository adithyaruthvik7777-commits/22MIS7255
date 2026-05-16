const { Log } = require("logging-middleware");
const { client } = require("../utils/apiClient");

function normaliseTask(v) {
  return {
    TaskID: v.TaskID ?? v.taskId ?? v.id,
    Duration: Number(v.Duration ?? v.duration),
    Impact: Number(v.Impact ?? v.impact)
  };
}

async function fetchVehicles() {
  await Log("backend", "info", "service", "vehiclesService.fetchVehicles start");
  const { data } = await client.get("/vehicles");
  const list = Array.isArray(data?.vehicles) ? data.vehicles : Array.isArray(data) ? data : [];
  const normalised = list
    .map(normaliseTask)
    .filter(
      (t) =>
        t.TaskID !== undefined &&
        Number.isFinite(t.Duration) &&
        Number.isFinite(t.Impact) &&
        t.Duration >= 0 &&
        t.Impact >= 0
    );
  await Log("backend", "info", "service", `vehiclesService.fetchVehicles got ${normalised.length} tasks`);
  return normalised;
}

module.exports = { fetchVehicles };