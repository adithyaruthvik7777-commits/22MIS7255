const express = require("express");
const asyncRoute = require("../middleware/asyncRoute");
const { runOptimization, runOptimizationCustom } = require("../controllers/optimizeController");

const router = express.Router();

router.get("/", asyncRoute(runOptimization));
router.post("/", asyncRoute(runOptimizationCustom));

module.exports = router;