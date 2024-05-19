const { Router } = require("express");
const { isAuthorized } = require("./auth_router");
const FoodDAO = require("../daos/food_dao");
const router = Router();

// const isAdmin = async (req, res, next) => {
//   const decodedToken = req.decodedToken;

//   if(decodedToken.roles.includes('admin')) {
//     next();
//   } else {
//     res.status(403).send("Forbidden: You are not authorized to access this resource!");
//   }
// }

router.post("/", isAuthorized, async(req, res, next) => {
  console.log("foods_router, post /, called");
  const foodObj = req.body;
  console.log("foods_router, post /, foodObj", foodObj);

  const food = await FoodDAO.createFood(foodObj);
  if(!food) {
    console.error("food return from create is null!");
    res.status(400).send("Food is null!");
  } else {
    res.send(food);
  }
})

// Get all foods: GET /foods - open to all users
router.get("/", isAuthorized, async (req, res, next) => {
  const foods = await FoodDAO.getFoods();
  res.send(foods);
});

// Get specific items: GET /items/:id - open to all users
router.get("/:id", isAuthorized, async (req, res, next) => {
  console.log("food_router, get /:id, called");
  const foodId = req.params.id;
  console.log("food_router, get /:id, foodId:", foodId);
  const food = await FoodDAO.getFood(foodId);
  console.log("food_router, get /:id, food:", food);
  if(!food) {
    res.status(400).send("Food does not exist");
  } else {
    res.send(food);
  }
});

// Update a note: PUT /items/:id - restricted to users with the "admin" role
router.put("/:id", isAuthorized, async (req, res, next) => {
  console.log("food_router, Put /:id, called");
  const foodId = req.params.id;
  const foodObj = req.body;

  console.log("food_router, put /:id, foodId, foodObj:", foodId, foodObj);
  const food = await FoodDAO.updateFood(foodId, foodObj);
  console.log("food_router, put /:id, food:", food);
  if(!food) {
    res.send(400).send("Food does not exist");
  } else {
    res.send(food);
  }
});

module.exports = router;