const express = require("express");
const asyncRoute = require("../middleware/asyncRoute");
const { listDepots } = require("../controllers/depotsController");

const router = express.Router();
router.get("/", asyncRoute(listDepots));
module.exports = router;