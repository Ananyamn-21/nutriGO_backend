
const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    id: Number,
    title: String,
    readyInMinutes: Number,
    servings: Number,
});

const nutrientsSchema = new mongoose.Schema({
    calories: Number,
    protein: Number,
    fat: Number,
    carbohydrates: Number
});

const daySchema = new mongoose.Schema({
    meals: [mealSchema],
    nutrients: nutrientsSchema
});

const mealPlanSchema = new mongoose.Schema({
    userId: String,
    week: {
        monday: daySchema,
        tuesday: daySchema,
        wednesday: daySchema,
        thursday: daySchema,
        friday: daySchema,
        saturday: daySchema,
        sunday: daySchema
    }
});

module.exports = mongoose.model('MealPlan', mealPlanSchema);
