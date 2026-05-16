const { Log } = require("logging-middleware");
const { fetchDepots, totalMechanicHours } = require("../services/depotsService");

async function listDepots(req, res) {
  await Log("backend", "info", "controller", "depotsController.listDepots");
  const depots = await fetchDepots();
  res.json({
    depots,
    totalMechanicHours: totalMechanicHours(depots),
    count: depots.length
  });
}

module.exports = { listDepots };