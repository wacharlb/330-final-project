const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  servingSize: { type: Number, required: true },
  servingSizeUnits: { type: String, require: true },
  servings: {type: Number, required: true },
  carbs: { type: Number, required: false },
  protein: { type: Number, require: false },
  fat: { type: Number, required: true },
  sodium: { type: Number, required: false}
});

module.exports = mongoose.model("foods", foodSchema);