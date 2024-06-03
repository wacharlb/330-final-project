const Meal = require('../models/meal');
const FoodDAO = require('./food_dao');
const mongoose = require('mongoose');

module.exports = {};

module.exports.createMeal = async (mealObj) => {
  console.log("meal_dao, createMeal, called");
  console.log("meal_dao, createMeal, mealObj:", mealObj);
  try {
    const meal = await Meal.create(mealObj);
    console.log("meal_dao, createMeal, meal:", meal);
    return meal;
  } catch(error) {    
    return null;
  }
}

module.exports.getMeals = async (userId, roles) => {
  console.log("meal_dao, getMeals, called");
  console.log("meal_dao, getMeals, userId:", userId);
  console.log("meal_dao, getMeals, roles:", roles);
  try {
    let meals = null;
    if(roles.includes("admin")) {
      console.log("meal_dao, getMeals, isAdmin");
      meals = await Meal.find({}).lean(); 
      // return meals;
    } else if(roles.includes("user")) {
      console.log("meal_dao, getMeals, isUser");
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
  console.log("meal_dao, getStats, called");
  console.log("meal_dao, getStats, mealIds:", mealIds);
  console.log("meal_dao, getStats, userId:", userId);
  
  const meals = await Meal.find({userId: userId});
  console.log("meal_dao, getStats, meals:", meals);

  console.log("meal_dao, getStats, userId good!");
  
  // const mealObjectIds = mealIds.map(id => new mongoose.Types.ObjectId(id)); // Use 'new'

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
    // {
    //   $lookup: {
    //     from: 'foods', // The name of the food collection
    //     localField: 'foods',
    //     foreignField: '_id',
    //     as: 'foods'
    //   }
    // },

    // {
    //   $lookup: {
    //     from: 'meals',
    //     localField: '_id',
    //     foreignField: '_id',
    //     as: 'meals'
    //   }
    // },
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
  console.log("meal_dao, getStats, mealsStats", JSON.stringify(mealsStats, null, 2));
  return mealsStats[0];
}


module.exports.deleteAll = async (userId, roles) => {
  console.log("meal_dao deleteAll, called:");
  try{  
    if(roles.includes("admin")) {
      const meals = await Meal.deleteMany({});
      console.log("meal_dao, deleteAll, admin user, meals:", meals);
      return true;
    } else if(roles.includes("user")) {
      const meals = await Meal.deleteMany({ userId: userId });
      console.log("meal_dao, deleteAll, normal user, meals:", meals);
      return true;
    }
  } catch(error) {
    console.error("food_dao deleteAll, error:", error);
    return false;
  }
}

module.exports.delete = async (userId, mealId) => {
  console.log("meal_dao delete, called:");
  try{
    const meals = await Meal.deleteOne({userId: userId, mealId: mealId});
    console.log("meal_dao, delete, user, meals:", meals);
    return true
  } catch(error) {
    console.error("food_dao deleteAll, error:", error);
    return false;
  }
}