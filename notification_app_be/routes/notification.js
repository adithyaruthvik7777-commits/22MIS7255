const express = require("express");
const asyncRoute = require("../middleware/asyncRoute");
const { listNotifications } = require("../controllers/notificationsController");

const router = express.Router();
router.get("/", asyncRoute(listNotifications));
module.exports = router;