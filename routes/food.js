const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Food = require('../models/Food')
const Recipe = require('../models/Recipes')
const Order = require('../models/FoodOrder')
const MealPlan = require('../models/MealPlan');
const Report = require('../models/Report')
const Feedback = require('../models/Feedback')

const router = express.Router()
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()


const GetRecipes = process.env.FETCH_RECIPE
const SEARCH = process.env.SEARCH
const REC_INFO = process.env.REC_INFO
const apiKey=  process.env.KEY
const MEAL_PLAN = process.env.MEAL_PLAN


function calculateCalories({ age, gender, currentWeight, height, goal }) {
    let bmr;

    // Harris Benedict formula 
    if (gender === 'male') {
        bmr = 88.362 + (13.397 * currentWeight) + (4.799 * height) - (5.677 * age);
    } else if (gender === 'female') {
        bmr = 447.593 + (9.247 * currentWeight) + (3.098 * height) - (4.330 * age);
    } else {
        throw new Error("Invalid gender");
    }

    if (goal === 'weight_loss') {
        return bmr * 0.85; 
    } else if (goal === 'maintenance') {
        return bmr; 
    } else if (goal === 'weight_gain') {
        return bmr * 1.15;
    } else {
        throw new Error("Invalid goal");
    }
}

router.get('/fetchRandomRecipe', async (req, res) => {
    try {
    
      const response = await axios.get(`${GetRecipes}`, {params: {apiKey}});
  
      const recipes = response.data.recipes; 

  
      for (let data of recipes) {
        const newRecipe = new Recipe({
          title: data.title,
          id:data.id,
          vegetarian: data.vegetarian,
          vegan: data.vegan,
          pricePerServing: data.pricePerServing,
          readyInMinutes: data.readyInMinutes,
          servings: data.servings,
          cuisines: data.cuisines,
          dishTypes: data.dishTypes,
          diets: data.diets,
          occasions: data.occasions,
          instructions: data.instructions,
          analyzedInstructions: data.analyzedInstructions,
          image: data.image,
          description: data.summary,
        });
  
        
        await newRecipe.save();
      }
  
      res.status(201).json({ message: 'Recipes saved successfully!' });
  
    } catch (error) {
      console.error('Error fetching data', error);
      res.status(500).json({ message: 'Error fetching data' });
    }
  });
  






router.post('/addFood', async (req, res) => {
    const { foodID, title, description, image, price, calories, nutrition, ingredients, cookingInstructions, veg } = req.body;

    try {
       
        const food = new Food({
            foodID,
            title,
            description,
            image,
            price,
            calories,
            nutrition,
            ingredients,
            cookingInstructions,
            veg
        })

        await food.save();

        res.status(200).json({ "Message": "Food item saved successfully" });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ "Error": error.message });
    }
});



  router.get('/search/:ingredient', async (req, res) => {
    const {ingredient} = req.params
  
    try {
    const response = await axios.get(`${SEARCH}?ingredients=${ingredient}&number=10&limitLicense=true&ranking=1&ignorePantry=false`,{params: {apiKey}})   
    data = response.data
    const formattedRecipes = data.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        ingredients: [
          ...recipe.usedIngredients.map(ingredient => ingredient.name),  
          ...recipe.missedIngredients.map(ingredient => ingredient.name)  
        ]
      }));

   

      
      res.status(200).json(formattedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });



router.get('/recipes/getInfo/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const recipeResponse = await Recipe.findOne({ id });
        console.log(recipeResponse, "rec response");

        if (!recipeResponse) {
         
            const response = await axios.get(`${REC_INFO}/${id}/information`, { params: { apiKey } });
            const data = response.data;
       
            const recipe = {
                id: data.id,
                title: data.title,
                vegetarian: data.vegetarian,
                vegan: data.vegan,
                pricePerServing: data.pricePerServing,
                readyInMinutes: data.readyInMinutes,
                servings: data.servings,
                cuisines: data.cuisines,
                dishTypes: data.dishTypes,
                diets: data.diets,
                occasions: data.occasions,
                instructions: data.instructions,
                analyzedInstructions: data.analyzedInstructions,
                image: data.image,
                description: data.summary,
            };
            const newRecipe = new Recipe(recipe);
            await newRecipe.save();

            return res.status(200).json(recipe);
        }

        return res.status(200).json(recipeResponse);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ "Error": "Internal Server Error" });
    }
});



router.post('/order', async (req, res) => {
    const { userId,items } = req.body;
   


    try {
        
       
        let totalPrice = 0;
        const orders = [];

        for (const item of items) {
            const foodItem = await Recipe.findOne({ id: item.itemId });
            if (!foodItem) {
                res.status(404).json({ message: `Food item with ID ${item.itemId} not found` });
                return;
            }

            const itemTotalPrice = foodItem.pricePerServing * item.quantity;
            totalPrice += itemTotalPrice;

            orders.push({
                foodItem: {
                    itemId: foodItem.id,
                    itemName: foodItem.title,
                    description: foodItem.description,
                    itemPrice: foodItem.pricePerServing,
                    image:foodItem.image
                },
                quantity: item.quantity,
                totalPrice: itemTotalPrice
            });
        }

        const order = new Order( {
            userId: userId,
            orders: orders,
            orderedAt: new Date(),
            orderStatus:"Placed",
            priceSummary: totalPrice
        })

        await order.save()

        res.status(201).json({ message: 'Order placed successfully', order: order });
        
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } 
});




router.put('/mealplan/addUserInfo', async (req, res) => {
    const { userId, age, gender, currentWeight, height, goal, vegOnly, allergy } = req.body

    try {
     
        const user = await User.findOne({ userId })

        if (!user) {
            return res.status(404).json({ "message": "User not found or invalid userId" })
        }

        if (age !== undefined) user.age = age
        if (gender !== undefined) user.gender = gender
        if (currentWeight !== undefined) user.currentWeight = currentWeight
        if (height !== undefined) user.height = height
        if (goal !== undefined) user.goal = goal
        if (vegOnly !== undefined) user.vegOnly = vegOnly
        if (allergy !== undefined) user.allergy = allergy

      
        const maxCalories = calculateCalories({ age: user.age, gender: user.gender, currentWeight: user.currentWeight, height: user.height, goal: user.goal })
        user.maxCalories = maxCalories; 

        await user.save();

        res.status(200).json({ "message": "User data updated successfully", "maxCalories": maxCalories})
    } catch (err) {
        console.error(err.message)
        res.status(500).json({ "error": "Internal Server Error" })
    }
});


router.post('/mealplan', async (req, res) => {
    const { userId, timeFrame } = req.body;

    try {
       
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(400).json({ "message": "User not found" });
        }

        const targetCalories = user.maxCalories;
        const excludes = user.allergy;
        let diet = user.vegOnly ? "vegetarian" : "";

        const mealplanResponse = await axios.get(`${MEAL_PLAN}`, {
            params: {
                timeFrame: timeFrame,
                targetCalories: targetCalories,
                diet: diet,
                exclude: excludes,
                apiKey: apiKey
            }
        });

        const mealplanData = mealplanResponse.data.week || mealplanResponse.data.day;

        const weekData = {};
        const defaultNutrientValues = {
            calories: 0,
            protein: 0,
            fat: 0,
            carbohydrates: 0
        };

        for (const [day, data] of Object.entries(mealplanData)) {
            weekData[day] = {
                meals: data.meals.map(meal => ({
                    id: meal.id,
                    title: meal.title,
                    readyInMinutes: meal.readyInMinutes,
                    servings: meal.servings,
                    
                })),
                nutrients: {
                    calories: data.nutrients.calories || defaultNutrientValues.calories,
                    protein: data.nutrients.protein || defaultNutrientValues.protein,
                    fat: data.nutrients.fat || defaultNutrientValues.fat,
                    carbohydrates: data.nutrients.carbohydrates || defaultNutrientValues.carbohydrates
                }
            };
        }

        const newMealPlan = new MealPlan({
            userId: userId,
            week: weekData
        });

        await newMealPlan.save();

        res.status(201).json({
            message: 'Meal plan generated and saved successfully',
            mealPlan: mealplanResponse.data
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ "Error": "Internal Server Error" });
    }
});



router.get('/mealplan/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
       
        const mealplan = await MealPlan.findOne({ userId: userId });

        if (!mealplan) {
            return res.status(404).json({ message: "Invalid userId, no meal plan found" });
        }

        return res.status(200).json(mealplan);
    } catch (err) {
      
        console.error(err.message);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


  router.get('/getAllRecipes', async (req, res) => {
    try {
      const recipes = await Recipe.find();
  
      if (recipes.length === 0) {
        return res.status(404).json({ message: "No recipes found" }); 
      }
  
      res.status(200).json(recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  router.get('/getAllMealPlans', async (req, res) => {
    try {
      const recipes = await MealPlan.find();
  
      if (recipes.length === 0) {
        return res.status(404).json({ message: "No recipes found" }); 
      }
  
      res.status(200).json(recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  
  
router.get('/food/all_orders',async(req,res)=>{
    

    try{
      
        const orders = await Order.find()
        if(!orders){
            res.status(404).json({"Message":"No orders found"})
        }

        res.status(200).json(orders)

    }
    catch(Error){
        console.log({Error:Error.message})
        res.status(500).json({message:"Server error"})
    }
    

})

router.put('/order/updateStatus',async(req,res)=>{
    const{orderId,currentStatus} = req.body
   

    try{
        
        const result = await Order.findOneAndUpdate({_id:new ObjectId(orderId)},{ $set: { orderStatus: currentStatus } });

        if (!result) {
            return res.status(404).json({ message: "orders with provided orderID not found" });
        }

        return res.status(200).json({ message: "order status updated successfully" });
    } catch (error) {
        console.error("Error updating", error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

router.get('/allusers',async(req,res)=>{

    try{
        const users = await User.find()
        if(users.length === 0){
            return res.json({"message":"No users found"})
        }
        return res.status(200).json(users)
    }
    catch(err){
        res.status(500).json({"Error":"Internal Server Error"})
        console.log(err.message)
    }
})

router.get('/user/:id',async(req,res)=>{
    const {id} = req.params
    try{
        const user = await User.findById(id)
        if(!user){
            return res.json({"message":"ivalid userId "})
        }
        return res.status(200).json(user)
    }
    catch(err){
        res.status(500).json({"Error":"Internal Server Error"})
        console.log(err.message)
    }
})


router.delete('/user/delete/:id',async(req,res)=>{
    const {id} = req.params
    try{
        const user = await User.findByIdAndDelete(id)
        if(!user){
            return res.json({"message":"ivalid userId "})
        }
        return res.status(200).json(user)
    }
    catch(err){
        res.status(500).json({"Error":"Internal Server Error"})
        console.log(err.message)
    }
})


//fetch add recipe requests

router.get('/requests', async (req, res) => {
    try {
        const requests = await Food.find(); 
        
        if (requests.length === 0) { 
            return res.json({ "message": "No new requests" });
        }

        return res.status(200).json(requests);
    } catch (err) {
        res.status(500).json({ "Error": "Internal Server Error" });
        console.log(err.message);
    }
});


router.put('/requests/updateStatus', async (req, res) => {
     const{foodId,status} = req.body
   

    try{
        
        const result = await Food.findOneAndUpdate({_id:new ObjectId(foodId)},{ $set: { Status: status } });

        if (!result) {
            return res.status(404).json({ message: "Recipe with provided ID not found" });
        }
        const recipe = new Recipe(result)
        return res.status(200).json({ message: "status updated successfully" });
    } catch (error) {
        console.error("Error updating", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});



router.get('/users/count', async (req, res) => {
    try {
      const userCount = await User.countDocuments();
      res.json({ count: userCount });
    } catch (error) {
      console.error('Error fetching user count:', error);
      res.status(500).json({ message: 'Error fetching user count' });
    }
  });

  router.get('/food/count', async (req, res) => {
    try {
      const recipeCount = await Food.countDocuments();
      res.json({ count: recipeCount });
    } catch (error) {
      console.error('Error fetching recipe count:', error);
      res.status(500).json({ message: 'Error fetching recipe count' });
    }
  });

  router.get('/recipe/count', async (req, res) => {
    try {
      const recipeCount = await Recipe.countDocuments();
      res.json({ count: recipeCount });
    } catch (error) {
      console.error('Error fetching recipe count:', error);
      res.status(500).json({ message: 'Error fetching recipe count' });
    }
  });
  

  router.get('/orders/count', async (req, res) => {
    try {
      const foodOrderCount = await Order.countDocuments();
      res.json({ count: foodOrderCount });
    } catch (error) {
      console.error('Error fetching food order count:', error);
      res.status(500).json({ message: 'Error fetching food order count' });
    }
  });




  router.get('/new_orders', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 3; 
      const orders = await Order.find().sort({ orderedAt: -1 }).limit(limit); 
  
      res.json({ orders });
    } catch (error) {
      console.error('Error fetching new food orders:', error);
      res.status(500).json({ message: 'Error fetching new food orders' });
    }
  });


  router.get('/new_requests', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 3; 
      const recipes = await Food.find().sort({ createdAt: -1 }).limit(limit); 
  
      res.json({ recipes });
    } catch (error) {
      console.error('Error fetching new recipe requests:', error);
      res.status(500).json({ message: 'Error fetching new recipe requests' });
    }
  });
  


  router.post('/feedback', async (req, res) => {
    const { name, email, feedback } = req.body;

    if (!name || !email || !feedback) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const feed = new Feedback({ name, email, feedback });
        await feed.save();
        res.status(201).json({ message: 'Feedback submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while submitting feedback.', error });
        console.log(error.message)
    }
});


router.post('/report', async (req, res) => {
    const { name, email, problem} = req.body;

    if (!name || !email || !problem ) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const report = new Report({ name, email, problem });
        await report.save();
        res.status(201).json({ message: 'Report submitted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while submitting the report.', error });
        console.log(error.message)
    }
});



router.get('/allReports', async (req, res) => {
    try {
      const reports = await Report.find(); 
      res.status(200).json(reports); 
    } catch (error) {
      res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
  });
  

  router.get('/allFeedbacks', async (req, res) => {
    try {
      const feedbacks = await Feedback.find(); 
      res.status(200).json(feedbacks); 
    } catch (error) {
      res.status(500).json({ message: 'Error fetching feedbacks', error: error.message });
    }
  });

 

  router.delete('/feedbacks/delete/:id', async (req, res) => {
    try {
      const feedbackId = req.params.id;
   
      const deletedFeedback = await Feedback.findByIdAndDelete(feedbackId);
  
      if (!deletedFeedback) {
        return res.status(404).json({ success: false, message: "Feedback not found" });
      }
   
      res.json({ success: true, message: "Feedback deleted successfully" });
    } catch (error) {
    
      console.error("Error deleting feedback:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


module.exports = router
