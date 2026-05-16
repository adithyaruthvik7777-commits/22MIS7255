const express = require("express");

const notificationsRouter = require("./notification");
const priorityInboxRouter = require("./priorityInbox");

const router = express.Router();

router.use("/notifications", notificationsRouter);
router.use("/priority-inbox", priorityInboxRouter);

module.exports = router;