const express = require("express");

const depotsRouter = require("./depots");
const vehiclesRouter = require("./vehicles");
const optimizeRouter = require("./optimize");

const router = express.Router();

router.use("/depots", depotsRouter);
router.use("/vehicles", vehiclesRouter);
router.use("/optimize", optimizeRouter);

module.exports = router;