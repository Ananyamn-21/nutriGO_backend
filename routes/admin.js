const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Food = require('../models/Food')
const Recipe = require('../models/Recipes')
const Order = require('../models/FoodOrder')
const MealPlan = require('../models/MealPlan');

const router = express.Router()
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()


const GetRecipes = process.env.FETCH_RECIPE
const SEARCH = process.env.SEARCH
const REC_INFO = process.env.REC_INFO
const apiKey=  process.env.KEY
const MEAL_PLAN = process.env.MEAL_PLAN



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

  
  
router.get('/food/all_orders',async(req,res)=>{
    

    try{
      
        const orders = await Order.find().toArray()
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


  


module.exports = router
