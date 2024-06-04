const { Router } = require("express");
const { isAuthorized } = require("./auth_router");
const MealDAO = require("../daos/meal_dao");
const UserDAO = require("../daos/user_dao");
const FoodDAO = require("../daos/food_dao");

const router = Router();

// Create: POST /meals - Takes an array of food _id values 
// (repeat values can appear). Meal should be created with 
// a total field for the total calories, total carbs and
// total fat. The meal should also have the userId of the 
// user the created the meal.
router.post("/", isAuthorized, async (req, res, next) => {
  const foods = req.body.foods;
  const mealType = req.body.mealType;
  const decodedToken = req.decodedToken;
  const email = req.decodedToken.email;

  // Get the user by email
  const user = await UserDAO.getUser(email);
  if(!user) {
    res.status(400).send("User does not exist");
  }

  // verify all items in the array exist
  let totalCalories = 0;
  let totalCarb = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalSodium = 0;
  for(const foodId of foods) {
    const food = await FoodDAO.getFood(foodId);

    if(!food) {
      return res.status(400).send("Item does not exist!");
    } else {
      // Add the price of the item to the total price
      totalCalories = totalCalories + (food.calories * food.servings);
      totalCarb = totalCarb + (food.carbs * food.servings);
      totalProtein = totalProtein + (food.protein * food.servings);
      totalFat = totalFat + (food.fat * food.servings);
      totalSodium = totalSodium + (food.sodium * food.servings);
    }
  }

  // Create a new order object
  const mealObj = {
    userId: user._id, 
    foods: foods,
    mealType: mealType,
    totalCalories: totalCalories,
    totalCarb: totalCarb,
    totalProtein: totalProtein,
    totalFat: totalFat,
    totalSodium: totalSodium
  };

  const meal = await MealDAO.createMeal(mealObj);

  if(!meal) {
    res.status(400).send("Meal is null!");
  } else {
    res.send(meal);
  }
});


// GET /meals - return all the meals made by the user 
// making the request if not an admin user. If they are an 
// admin user it should return all orders in the DB.
router.get("/", isAuthorized, async (req, res, next) => {
  const userId = req.decodedToken._id;
  const roles = req.decodedToken.roles;
  const meals = await MealDAO.getMeals(userId, roles);

  if(!meals) {
    res.status(400).send("No meals found for the given user!");
  } else {
    res.send(meals);
  }
});

router.get("/stats", isAuthorized, async (req, res, next) => {
  const mealIds = req.body.mealIds;
  const email = req.decodedToken.email;

  // Get the user id
  const user = await UserDAO.getUser(email);
  if(!user) {
    return res.status(400).send("User does not exist!");
  }

  const mealsStats = await MealDAO.getStats(user._id, mealIds);
  res.json(mealsStats);
});

// Get an meal: GET /meals/:id -  return an meal with 
// the foods array containing the full food objects rather 
// than just their _id. If the user is a normal user return
// a 404 if they did not create the meal. An admin user 
// should be able to get any meal for any user.
router.get("/:id", isAuthorized, async (req, res, next) => {
  const mealId = req.params.id;
  const decodedToken = req.decodedToken;
  const email = decodedToken.email;

  // Get the user id
  const user = await UserDAO.getUser(email);
  if(!user) {
    return res.status(400).send("User does not exist!");
  }

  // Get the order
  const meal = await MealDAO.getMeal(user, mealId);
  if(!meal) {
    res.status(400).send("Meal does not exist!");
  } else if(user.roles.includes("admin") || user._id.toString() === meal.userId.toString()) {
    res.send(meal);
  } else {
    res.status(404).send("User not authorized!");
  }
});

// DELETE /meals - deletes all meals made by a user making the
// request if not an admin user. If they are an admin user it
// should delete all meals in the DB.
router.delete("/", isAuthorized, async (req, res, next) => {
  const userId = req.decodedToken._id;
  const roles = req.decodedToken.roles;

  try {
    const success = await MealDAO.deleteAll(userId, roles);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

// DELETE /meals - deletes all meals made by a user making the
// request if not an admin user. If they are an admin user it
// should delete all meals in the DB.
router.delete("/:id", isAuthorized, async (req, res, next) => {
  const mealId = req.params.id;
  const email = req.decodedToken.email;

  // Get the user by email
  const user = await UserDAO.getUser(email);
  if(!user) {
    res.status(400).send("User does not exist");
  }

  try {
    const success = await MealDAO.delete(user._id, mealId);
    res.sendStatus(success ? 200 : 400);
  } catch(e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;