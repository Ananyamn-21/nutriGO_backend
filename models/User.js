const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    userId: {
        type: String,
        required: true,
        unique: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    age: {
        type: Number,
        default:0
          
    },
    gender: {
        type: String,
        default:"n/a"
        
    },
    currentWeight: {
        type: Number,
        default:0
     
    },
    height: {
        type: Number,
        default:0
    },
    goal: {
        type: String,
        default:"n/a"
       
    },
    vegOnly: {
        type: Boolean,
        default: false
    },
    allergy: {
        type: [String], 
        default: []
    },
    maxCalories: {
        type: Number, 
        default:     0
    }
});


const User = mongoose.model('User', userSchema);
module.exports = User;