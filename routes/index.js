const { Router } = require("express");
const router = Router();

const { router: authRouter } = require('./auth_router');
// const { router: foodsRouter } = require('./foods_router');
// const { router: mealRouter } = require('./meals_router');

router.use("/auth", authRouter);
// router.use("/foods", foodsRouter);
router.use("/foods", require("./foods_router"));
router.use("/meals", require("./meals_router"));
// router.use("/meals", mealRouter);

module.exports = router;