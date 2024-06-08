
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email : {
        type : String,
        toBeRequired : true,
        unique : true
    }, 
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now  
    }
  });

  const user = mongoose.model('User',userSchema);
  user.createIndexes();
  module.exports = user;