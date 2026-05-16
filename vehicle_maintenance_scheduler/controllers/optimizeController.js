const { Log } = require("logging-middleware");
const { fetchDepots, totalMechanicHours } = require("../services/depotsService");
const { fetchVehicles } = require("../services/vehiclesService");
const { optimize } = require("../services/optimizer");

async function runOptimization(req, res) {
  await Log("backend", "info", "controller", "optimizeController.runOptimization");

  const [depots, tasks] = await Promise.all([fetchDepots(), fetchVehicles()]);
  const budget = totalMechanicHours(depots);

  if (tasks.length === 0) {
    await Log("backend", "warn", "controller", "optimizeController: no tasks returned by /vehicles");
    return res.json({
      selectedTasks: [],
      totalImpact: 0,
      totalDuration: 0,
      mechanicHourBudget: budget,
      depotCount: depots.length,
      taskCount: 0
    });
  }
  if (budget <= 0) {
    await Log("backend", "warn", "controller", "optimizeController: no mechanic-hour budget");
    return res.json({
      selectedTasks: [],
      totalImpact: 0,
      totalDuration: 0,
      mechanicHourBudget: 0,
      depotCount: depots.length,
      taskCount: tasks.length
    });
  }

  const result = await optimize(tasks, budget);
  res.json({
    ...result,
    depotCount: depots.length,
    taskCount: tasks.length
  });
}


async function runOptimizationCustom(req, res) {
  const { tasks, mechanicHours } = req.body || {};
  if (!Array.isArray(tasks)) {
    await Log("backend", "warn", "controller", "POST /optimize: body.tasks is not an array");
    const e = new Error("Body must contain tasks: []");
    e.status = 400;
    throw e;
  }
  const hours = Number(mechanicHours);
  if (!Number.isFinite(hours) || hours <= 0) {
    await Log("backend", "warn", "controller", `POST /optimize: invalid mechanicHours=${mechanicHours}`);
    const e = new Error("mechanicHours must be a positive number");
    e.status = 400;
    throw e;
  }

  const result = await optimize(tasks, hours);
  res.json(result);
}

module.exports = { runOptimization, runOptimizationCustom };