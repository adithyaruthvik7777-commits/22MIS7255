const { Log } = require("logging-middleware");
const { client } = require("../utils/apiClient");

function normaliseDepot(d) {
  return {
    id: d.ID ?? d.id ?? d.DepotID,
    mechanicHours: Number(d.MechanicHours ?? d.mechanicHours ?? 0)
  };
}

async function fetchDepots() {
  await Log("backend", "info", "service", "depotsService.fetchDepots start");
  const { data } = await client.get("/depots");
  const list = Array.isArray(data?.depots) ? data.depots : Array.isArray(data) ? data : [];
  const normalised = list.map(normaliseDepot).filter((d) => d.id !== undefined);
  await Log("backend", "info", "service", `depotsService.fetchDepots got ${normalised.length} depots`);
  return normalised;
}

function totalMechanicHours(depots) {
  return depots.reduce((sum, d) => sum + (Number.isFinite(d.mechanicHours) ? d.mechanicHours : 0), 0);
}

module.exports = { fetchDepots, totalMechanicHours };