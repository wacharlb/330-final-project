const Food = require('../models/food');

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
  console.log("food_dao updateFood, foodId HHHHHH:", foodId);
  console.log("food_dao updateFood, foodObj:", foodObj);
  const food = await Food.findOneAndUpdate(
    { _id: foodId},
    { 
      name: foodObj.name,
      calories: foodObj.calories,
      servingSize: foodObj.servingSize,
      servingSizeUnits: foodObj.servingSizeUnits,
      servings: foodObj.servings,
      carbs: foodObj.carbs,
      fat: foodObj.fat,
      sodium: foodObj.sodium
    },
    { new: true }
  ).lean();
  console.log("food_dao updateFood, food:", food);

  return food;
}