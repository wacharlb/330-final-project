const { Router } = require("express");
const router = Router();

const { router: authRouter } = require('./auth_router');

router.use("/auth", authRouter);
router.use("/foods", require("./foods_router"));
router.use("/meals", require("./meals_router"));

module.exports = router;