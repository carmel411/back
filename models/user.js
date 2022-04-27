const Joi = require('joi');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');

const userSchema = new mongoose.Schema({
name: {
type: String,
required: true,
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
admin: {
type: Boolean,
required: true
},
createdAt: { type: Date, default: Date.now },
posts: Array

});

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, admin: this.admin }, config.get('jwtKey'));
    return token;
  }

const User = mongoose.model('User', userSchema);

function validateUser(user) {
const schema = Joi.object({
name: Joi.string().min(2).max(255).required(),
email: Joi.string().min(6).max(255).required().email(),
password: Joi.string().min(6).max(1024).required(),
admin: Joi.boolean().required()
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
exports.validatePosts = validatePosts;
