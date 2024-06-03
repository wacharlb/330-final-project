const { Router } = require("express");
const { isAuthorized, isAdmin } = require("./auth_router");
const FoodDAO = require("../daos/food_dao");
const router = Router();

router.post("/", isAuthorized, async(req, res, next) => {
  const foodObj = req.body;
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
  const foodId = req.params.id;
  const food = await FoodDAO.getFood(foodId);

  if(!food) {
    res.status(400).send("Food does not exist");
  } else {
    res.send(food);
  }
});

// Update a note: PUT /items/:id - restricted to users with the "admin" role
router.put("/:id", isAuthorized, async (req, res, next) => {
  const foodId = req.params.id;
  const foodObj = req.body;
  const food = await FoodDAO.updateFood(foodId, foodObj);

  if(!food) {
    res.send(400).send("Food does not exist");
  } else {
    res.send(food);
  }
});

router.delete("/", isAuthorized, isAdmin, async (req, res, next) => {
  try {
    const success = await FoodDAO.deleteAll();
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

// Delete a food.
router.delete("/:id", isAuthorized, async (req, res, next) => {
  const foodId = req.params.id;

  try {
    const success = await FoodDAO.deleteById(foodId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;