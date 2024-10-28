const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const recipeSchema = new Schema({
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
  image:String,
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

});


const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
