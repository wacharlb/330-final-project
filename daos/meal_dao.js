const Meal = require('../models/meal');
const FoodDAO = require('./food_dao');

module.exports = {};

module.exports.createOrder = async (mealObj) => {
  const meal = await Meal.create(mealObj);
  return meal;
}

module.exports.getMeals = async (userId, roles) => {
  try {
    if(roles.includes("admin")) {
      const meals = await Meal.find({}).lean();
      return meals;
    } else if(roles.includes("user")) {
      const meals = await Meal.find({ userId: userId });
      return meals;
    }
  } catch {
    return null;
  }
}

module.exports.getMeal = async (user, mealId) => {
  try {
    let foodsArray = [];
    const meal = await Meal.findOne({ _id: mealId }).lean();

    for(const foodId of meal.foods) {
      const food = await FoodDAO.getFood(foodId);
      foodsArray.push(food);
    }
    meal.foods = foodsArray;
    return meal;  
  } catch {
    return null;
  }
}