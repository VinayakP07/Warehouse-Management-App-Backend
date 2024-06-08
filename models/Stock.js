
const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        required : true
    },
    product : {
        type : String,
        required : true
    }, 
    quantity : {
        type : Number,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    date : {
        type : Date,
        default : Date.now  
    }
  });

  module.exports = mongoose.model('Stock',stockSchema);