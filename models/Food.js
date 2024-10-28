const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  userId:String,
  title: String,
  id:Number,
  vegetarian: Boolean,
  vegan: Boolean,
  cuisines: [String],
  dishTypes: [String],
  diets: [String],
  occasions: [String],
  instructions: String,
  pricePerServing: Number,
  readyInMinutes: Number,
  servings: Number,
  description:String,
  analyzedInstructions: [{
    name: String,
    steps: [{
      number: Number,
      step: String,
      ingredients: [{
        id: Number,
        name: String,
        image: String,
      }],
    }]
  }],
  
status:{
        type:String,
        default:"Pending"
    }
});

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;