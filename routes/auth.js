const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Admin = require('../models/Admin')
const Order = require('../models/FoodOrder')
const MealPlan = require('../models/MealPlan');
const router = express.Router()

  

function generateUserId(username) {
    const randomDigits = Math.floor(100 + Math.random() * 900); 

    const firstThreeLetters = username.slice(0, 3);
    const randomAlphabets = Array(3)
        .fill()
        .map(() => String.fromCharCode(97 + Math.floor(Math.random() * 26)))
        .join('');
    const userId = `${randomDigits}${firstThreeLetters}${randomAlphabets}`;
    return userId;
}




router.post('/register', async (req, res) => {
    const { username, email, password } = req.body
    const userId = generateUserId(username)

    try {
       
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'User already exists' })
        }

        user = new User({
             userId,
             username, 
             email, 
             password })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()


        res.status(201).json({ "message":"user registered successfully"})

    } catch (error) {
        res.status(500).json({"error":error, message: 'Server error' })
    }
});

router.post('/admin/register', async (req, res) => {
    const { username, email, password } = req.body
    const userId = generateUserId(username)

    try {
       
        let user = await Admin.findOne({ email })
        if (user) {
            return res.status(400).json({ message: 'User already exists' })
        }

        user = new Admin({
             userId,
             username, 
             email, 
             password })

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)

        await user.save()


        res.status(201).json({ "message":"user registered successfully"})

    } catch (error) {
        res.status(500).json({"error":error, message: 'Server error' })
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'invalid user' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' })
        }
            console.log(user.id)
        let flag = false
        const userId = user.userId
        const mp = await MealPlan.findOne({userId})
        console.log(mp)
        if(mp){
            flag = true
        }


        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.json({"Message":"Login success", token,userId:user.userId,username:user.username,flag})
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
})

router.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await Admin.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'invalid user' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' })
        }


        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' })

        res.json({"Message":"Login success", token,userId:user.userId })
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router
