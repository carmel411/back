const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');
const { string } = require('joi');
const fs = require('fs');



var base64avatar = base64_encode('images/default_avatar.jpg');
function base64_encode(file) {
  return "data:image/gif;base64,"+fs.readFileSync(file, 'base64');
}  


const userSchema = new mongoose.Schema({
name: {
type: String,
required: true,
minlength: 2,
maxlength: 255
},
phone: {
  type: String,
  required: false,
  minlength: 2,
  maxlength: 255
  },
  
email: {
type: String,
required: true,
minlength: 6,
maxlength: 255,
unique: true
},
password: {
type: String,
required: true,
minlength: 6,
maxlength: 1024
},
userStatus: {
type: Number,
required: true,
default: 0
},
avatar: {
  type: String,
  required: false,
  minlength: 6,
  maxlength: 100000000,
  default: base64avatar
  },
createdAt: { type: Date, default: Date.now }
,
posts: Array

});



userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, userStatus: this.userStatus }, config.get('jwtKey'));
    return token;
  }

const User = mongoose.model('User', userSchema);

function validateUser(user) {
const schema = Joi.object({
name: Joi.string().min(2).max(255).required(),
phone: Joi.string().min(2).max(255),
email: Joi.string().min(6).max(255).required().email(),
password: Joi.string().min(6).max(1024).required(),
userStatus: Joi.number().required(),
avatar: Joi.string().min(6).max(100000000)
});
return schema.validate(user);
}

function validateUserWithoutPassword(user) {
  const schema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().min(2).max(255),
  email: Joi.string().min(6).max(255).required().email(),
  userStatus: Joi.number().required(),
  avatar: Joi.string().min(6).max(100000000)
  });
  return schema.validate(user);
  }
  



function validatePosts(data) {
 
  const schema = Joi.object({
    posts: Joi.array().min(1)
  });
 
  return schema.validate(data);
}

exports.User = User;
exports.validate = validateUser;
exports.validateUserWithoutPassword = validateUserWithoutPassword;
// exports.validatePosts = validatePosts;
