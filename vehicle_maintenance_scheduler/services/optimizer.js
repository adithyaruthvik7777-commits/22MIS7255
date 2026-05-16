const { Log } = require("logging-middleware");

function normalizeTasks(rawTasks) {
  return rawTasks
    .map((t) => ({
      TaskID: t.TaskID ?? t.taskId ?? t.id,
      Duration: Number(t.Duration ?? t.duration),
      Impact: Number(t.Impact ?? t.impact)
    }))
    .filter(
      (t) =>
        t.TaskID !== undefined &&
        Number.isFinite(t.Duration) &&
        Number.isFinite(t.Impact) &&
        t.Duration >= 0 &&
        t.Impact >= 0
    );
}

function greedyByRatio(tasks, capacity) {
  const sorted = [...tasks].sort(
    (a, b) =>
      b.Impact / Math.max(b.Duration, 1e-9) -
      a.Impact / Math.max(a.Duration, 1e-9)
  );
  const selected = [];
  let used = 0;
  for (const t of sorted) {
    if (used + t.Duration <= capacity) {
      selected.push(t);
      used += t.Duration;
    }
  }
  const totalImpact = selected.reduce((s, t) => s + t.Impact, 0);
  return { selected, totalImpact, totalDuration: used };
}

function knapsack(tasks, capacity) {
  const cap = Math.floor(capacity);
  const n = tasks.length;

  if (n === 0 || cap <= 0) {
    return { selected: [], totalImpact: 0, totalDuration: 0 };
  }
  if (!tasks.every((t) => Number.isInteger(t.Duration))) {
    return greedyByRatio(tasks, capacity);
  }

  const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const { Duration: w, Impact: v } = tasks[i - 1];
    for (let c = 0; c <= cap; c++) {
      dp[i][c] = dp[i - 1][c];
      if (w <= c) {
        const take = dp[i - 1][c - w] + v;
        if (take > dp[i][c]) dp[i][c] = take;
      }
    }
  }

  const selected = [];
  let c = cap;
  for (let i = n; i >= 1; i--) {
    if (dp[i][c] !== dp[i - 1][c]) {
      selected.push(tasks[i - 1]);
      c -= tasks[i - 1].Duration;
    }
  }
  selected.reverse();

  const totalImpact = selected.reduce((s, t) => s + t.Impact, 0);
  const totalDuration = selected.reduce((s, t) => s + t.Duration, 0);
  return { selected, totalImpact, totalDuration };
}

async function optimize(rawTasks, mechanicHours) {
  await Log(
    "backend",
    "info",
    "service",
    `optimize start: ${rawTasks.length} candidate tasks, budget=${mechanicHours}h`
  );

  const tasks = normalizeTasks(rawTasks);
  if (tasks.length !== rawTasks.length) {
    await Log(
      "backend",
      "warn",
      "service",
      `optimize discarded ${rawTasks.length - tasks.length} malformed tasks`
    );
  }

  const result = knapsack(tasks, mechanicHours);

  await Log(
    "backend",
    "info",
    "service",
    `optimize done: picked=${result.selected.length} impact=${result.totalImpact} used=${result.totalDuration}/${mechanicHours}h`
  );

  return {
    selectedTasks: result.selected.map((t) => ({
      TaskID: t.TaskID,
      Duration: t.Duration,
      Impact: t.Impact
    })),
    totalImpact: result.totalImpact,
    totalDuration: result.totalDuration,
    mechanicHourBudget: mechanicHours
  };
}

module.exports = { optimize, knapsack, normalizeTasks, greedyByRatio };