const express = require("express");
const asyncRoute = require("../middleware/asyncRoute");
const { listVehicles } = require("../controllers/vehiclesController");

const router = express.Router();
router.get("/", asyncRoute(listVehicles));
module.exports = router;