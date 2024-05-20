const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  mealType: { type: String, required: true },
  totalCalories: { type: String, required: true },
  foods: { 
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "foods" }],
    required: true,
  },
  totalCalories: { type: Number, required: true },
  totalFat: { type: Number, require: false },
  totalCarb: { type: Number, require: false },
  totalSodium: { type: Number, require: false },
});

module.exports = mongoose.model("meals", mealSchema);
