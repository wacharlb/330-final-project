const { Router } = require("express");
const router = Router();

const { router: authRouter } = require('./auth_router');
// const { router: foodsRouter } = require('./foods_router');

router.use("/auth", authRouter);
// router.use("/foods", foodsRouter);
router.use("/foods", require("./foods_router"));
// router.use("/meals", require("./meals_router"));

module.exports = router;



// const { Router } = require("express");
// const router = Router();

// router.use("/items", require('./items'));
// router.get("/", (req, res, next) => {
//   res.send(`
//     <html>
//       <body>
//         <h1> Hello, world! </h1>
//       </body>
//     </html>
//   `)
// });

// module.exports = router;