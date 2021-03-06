const Joi = require('joi');
const mongoose = require('mongoose');
const _ = require('lodash');
const { array } = require('joi');


const postSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  postBody: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 9999999
  },
  summary: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  author: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 32
  },
  tags: {
    type: Array,
    required: false
  },
  imageUrl: {
    type: String,
    required: false,
    minlength: 11,
    maxlength: 4096
    
  },
  postNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 9999999999,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 255,
  },
  views:{
    type: Number,
    required: true,
    default: 0
  },
  comments:{
    type: Array,
    required: true,
    default: []
  }
});
const Post = mongoose.model('Post', postSchema);

function validatePost(post) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    summary: Joi.string().min(2).max(255).required(),
    postBody: Joi.string().min(2).max(9999999).required(),
    author: Joi.string().min(2).max(32).required(),
    imageUrl: Joi.string().min(2).max(4096),
    postNumber: Joi.string().min(3).max(9999999).required(),
    user_id: Joi.string().min(1).max(255).required(),
    views: Joi.number().required(),
    tags: Joi.array()
  });
  return schema.validate(post);
}


function validateUpdatedPost(post) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    summary: Joi.string().min(2).max(255).required(),
    postBody: Joi.string().min(2).max(9999999).required(),
    author: Joi.string().min(2).max(32).required(),
    imageUrl: Joi.string().min(2).max(4096),
    tags: Joi.array(),
    comments: Joi.array()
  });
  return schema.validate(post);
}



async function generatePostNumber(Post) {
  while (true) {
    let randomNumber = _.random(1000, 999999);
    let post = await Post.findOne({ postNumber: randomNumber });
    if (!post) return String(randomNumber);
  }
}

exports.Post = Post;
exports.validatePost = validatePost;
exports.validateUpdatedPost = validateUpdatedPost;
exports.generatePostNumber = generatePostNumber
