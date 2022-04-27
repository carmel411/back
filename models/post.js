const Joi = require('joi');
const mongoose = require('mongoose');
const _ = require('lodash');


const postSchema = new mongoose.Schema({
  postName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255
  },
  postBody: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 2048
  },
  postColor: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 10
  },
  tags: Array,
  postImage: {
    type: String,
    required: false,
    minlength: 11,
    maxlength: 1024
  },
  postNumber: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 999999999999,
    unique: true
  },
  user_id: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 99999999999,
  }
});
const Post = mongoose.model('Post', postSchema);

function validatePost(post) {
  const schema = Joi.object({
    postName: Joi.string().min(2).max(255).required(),
    postBody: Joi.string().min(2).max(2048).required(),
    postImage: Joi.string().min(11).max(1024),
    postColor: Joi.string().min(2).max(10),
    tags: Joi.array()
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
exports.generatePostNumber = generatePostNumber
