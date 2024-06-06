const Meal = require('../models/meal');
const FoodDAO = require('./food_dao');
const mongoose = require('mongoose');

module.exports = {};

module.exports.createMeal = async (mealObj) => {
  try {
    const meal = await Meal.create(mealObj);
    return meal;
  } catch(error) {    
    return null;
  }
}

module.exports.getMeals = async (userId, roles) => {
  try {
    let meals = null;
    if(roles.includes("admin")) {
      meals = await Meal.find({}).lean(); 
      // return meals;
    } else if(roles.includes("user")) {
      meals = await Meal.find({ userId: userId });
      // return meals;
    }
    // Fully populate the foods array
    for(const meal of meals) {
      let foodsArray = [];
      for(const foodId of meal.foods) {
        const food = await FoodDAO.getFood(foodId);
        foodsArray.push(food);
      }
      meal.foods = foodsArray;
    }
    return meals;
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

module.exports.getStats = async (userId, mealIds) => {
  const meals = await Meal.find({userId: userId});

  // Validate and convert meal IDs to ObjectIds
  const mealObjectIds = mealIds.map(id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`);
      throw new Error(`Invalid ObjectId: ${id}`);
    }
    return new mongoose.Types.ObjectId(id);
  });

  const mealsStats = await Meal.aggregate([
    {
      $match: {
        _id: { $in: mealObjectIds },
        userId:  new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $group: {
        _id: null,
        // meals: { $push: '$$ROOT' },
        meals: { $push: '$_id' },
        totalMealPlanCalories: { $sum: '$totalCalories' },
        totalMealPlanFat: { $sum: '$totalFat' },
        totalMealPlanCarb: { $sum: '$totalCarb' },
        totalMealPlanProtein: { $sum: '$totalProtein' },
        totalMealPlanSodium: { $sum: '$totalSodium' }
      }
    },
    {
      $project: {
        _id: 0,
        meals: 1,
        totalMealPlanCalories: 1,
        totalMealPlanFat: 1,
        totalMealPlanCarb: 1,
        totalMealPlanProtein: 1,
        totalMealPlanSodium: 1
      }
    }
  ]);
  return mealsStats[0];
}

module.exports.deleteAll = async (userId, roles) => {
  try{  
    if(roles.includes("admin")) {
      const meals = await Meal.deleteMany({});
      return true;
    } else if(roles.includes("user")) {
      const meals = await Meal.deleteMany({ userId: userId });
      return true;
    }
  } catch(error) {
    console.error("food_dao deleteAll, error:", error);
    return false;
  }
}

module.exports.delete = async (userId, mealId) => {
  try{
    const meals = await Meal.deleteOne({userId: userId, _id: mealId});
    return true
  } catch(error) {
    console.error("food_dao deleteAll, error:", error);
    return false;
  }
}