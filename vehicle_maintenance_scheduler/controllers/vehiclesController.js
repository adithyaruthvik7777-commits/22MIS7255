const { Log } = require("logging-middleware");
const { fetchVehicles } = require("../services/vehiclesService");

async function listVehicles(req, res) {
  await Log("backend", "info", "controller", "vehiclesController.listVehicles");
  const vehicles = await fetchVehicles();
  res.json({ vehicles, count: vehicles.length });
}

module.exports = { listVehicles };