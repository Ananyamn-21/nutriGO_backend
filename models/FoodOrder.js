const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodItemSchema = new Schema({

  itemId: {
    type: Number,
    required: true,
  },
  
  itemName: {
    type: String,
    required: true,
  },
  image:{
    type:String
  },

  description: {
    type: String,
  },

  itemPrice: {
    type: Number,
    required: true,
  },

});

const OrderSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },

  orders: [
    {
      foodItem: FoodItemSchema,
      quantity: {
        type: Number,
        required: true,
      },

      totalPrice: {
        type: Number,
        required: true,
      },
      
    },
  ],

  orderedAt: {
    type: Date,
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Placed',
  },

  priceSummary: {
    type: Number,
    required: true,
  },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order
