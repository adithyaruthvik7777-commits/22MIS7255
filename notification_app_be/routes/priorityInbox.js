const express = require("express");
const asyncRoute = require("../middleware/asyncRoute");
const { getPriorityInbox } = require("../controllers/priorityInboxController");

const router = express.Router();
router.get("/", asyncRoute(getPriorityInbox));
module.exports = router;