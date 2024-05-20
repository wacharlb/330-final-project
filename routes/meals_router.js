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
  const foodIdArray = req.body;
  const decodedToken = req.decodedToken;
  const email = req.decodedToken.email;

  // Get the user by email
  const user = await UserDAO.getUser(email);
  if(!user) {
    res.status(400).send("User does not exist");
  }

  // verify all items in the array exist
  let totalCalories = 0;
  for(const foodId of foodIdArray) {
    const food = await FoodDAO.getFood(foodId);
    if(!food) {
      return res.status(400).send("Item does not exist!");
    } else {
      // Add the price of the item to the total price
      totalCalories = totalCalories + food.calories;
    }
  }

  // Create a new order object
  const mealObj = {userId: user._id, items: foodIdArray, total: totalCalories};
  const meal = await MealDAO.createOrder(mealObj);
  if(!meal) {
    res.status(400);
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
  const meal = await MealDAO.getOrder(user, mealId);
  if(!meal) {
    res.status(400).send("Meal does not exist!");
  } else if(user.roles.includes("admin") || user._id.toString() === meal.userId.toString()) {
    res.send(meal);
  } else {
    res.status(404).send("User not authorized!");
  }
});

module.exports = router;