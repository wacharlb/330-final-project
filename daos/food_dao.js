const Food = require('../models/food');
const mongoose = require('mongoose');

module.exports = {};

module.exports.createFood = async (foodObj) => {
  try {
    const food = await Food.create(foodObj);
    return food;
  } catch (error) {
    console.error("food is null!");
    return null;
  }
}

module.exports.getFoods = async () => {
  const foods = await Food.find({}).lean();
  return foods;
}

module.exports.getFood = async (foodId) => {
  try {
    const food = await Food.findOne({ _id: foodId});
    return food;
  } catch {
    return null;
  }
}

// Update the user's password field
module.exports.updateFood = async (foodId, foodObj) => {
  const food = await Food.findOneAndUpdate(
    { _id: foodId},
    { 
      name: foodObj.name,
      calories: foodObj.calories,
      servingSize: foodObj.servingSize,
      servingSizeUnits: foodObj.servingSizeUnits,
      servings: foodObj.servings,
      carbs: foodObj.carbs,
      protein: foodObj.protein,
      fat: foodObj.fat,
      sodium: foodObj.sodium
    },
    { new: true }
  ).lean();
  return food;
}

module.exports.deleteAll = async () => {
  try{  
    await Food.deleteMany({});
    return true;
  } catch(error) {
    console.error("food_dao deleteAll, error:", error);
    return false;
  }
}

module.exports.deleteById = async (foodId) => {
  try{
    if (!mongoose.Types.ObjectId.isValid(foodId)) {
      return false;
    }
    await Food.deleteOne({ _id: foodId });
    return true;
  } catch(error) {
    console.error("food_dao deleteById, error:", error);
  }
}