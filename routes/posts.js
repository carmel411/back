const jwt = require('jsonwebtoken');
const config = require('config');
require('dotenv').config();
const express = require('express');
const _ = require('lodash');
const {
  Post,
  validateUpdatedPost,
  validatePost,
  generatePostNumber
} = require('../models/post');
const auth = require('../middleware/auth');
const writerAuth = require('../middleware/writerAuth.js')
const router = express.Router();
const {User} = require('../models/user');


// delete post
router.delete('/:id', writerAuth, async (req, res) => {
  // if (!req.user.userStatus) return res.status(403).send('You need userStatus pemission to perform this action.');
  if(req.user.userStatus===2){
    const post = await Post.findOneAndRemove({
      _id: req.params.id,
    });  
    if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post);
  }
  if(req.user.userStatus===1){
  const post = await Post.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id
  });
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post);
  
}});

// push comment to post
router.put('/comment/:id', async (req, res) => {
    let post = await Post.findById(req.params.id);
    post.comments.push(req.body)
    await post.save()
    res.send(post)
    
});


// update post
router.put('/:id', writerAuth, async (req, res) => {
  const {error} = validateUpdatedPost(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  // update by admin
  if (req.user.userStatus == 2) {
    let post = await Post.findOneAndUpdate({
      _id: req.params.id
    }, req.body)
    if (!post) return res.status(404).send('The post with the given ID was not found.');
    post = await Post.findOne({
      _id: req.params.id
    });
    res.send(post)} else
    {
    // update post by post author
    let post = await Post.findOneAndUpdate({
      _id: req.params.id,
      user_id: req.user._id
    }, req.body);
    if (!post) return res.status(404).send('The post with the given ID was not found.');
    post = await Post.findOne({
      _id: req.params.id
    });
    res.send(post)
  }
});

// get all posts
router.get('/allposts', async (req, res) => {
    const postsArray = await Post.find().select('-postBody'); 
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});

// get latest posts
router.get('/latest', async (req, res) => {
  const postsArray = await Post.find({}).sort({ _id: -1 }).limit(3).select('-postBody')
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});


// get posts by tag
router.get('/searchtag', async (req, res) => {
  const findTag = req.query.tag
  
  const postsArray = await Post.find({tags: findTag}).select('-postBody')
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});

// get posts by query
router.get('/searchquery', async (req, res) => {
  const findQuery = req.query.query
  const postsArray = await Post.find({ $or: [
    {"name" : {$regex : findQuery}},
    {"summary" : {$regex : findQuery}},
    {"postBody" : {$regex : findQuery}},
    {"author" : {$regex : findQuery}},
    {"tags" : {$regex : findQuery}}
  ],function(err,docs) {}
}).select('-postBody') 
  if (!postsArray) return res.status(404).send('The post not found.');
  if(postsArray){res.send(postsArray)};
});

// get posts by favorites
router.get('/favorites',auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-postBody');
  
  const postsArray = await Post.find({'_id': { $in: user.posts}});
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});

// get all tags
router.get('/tags', async (req, res) => {
  const data = await Post.find().select('tags');
  let arrayList = []
  data.map(post => post.tags.map(tag => arrayList.push(tag)));
  const uniqueTags = [...new Set(arrayList)]
res.send(uniqueTags);
});


// get post by ID
router.get('/:id', async (req, res) => {
  let post = await Post.findOne({
    _id: req.params.id
  })
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post)
  // update views
  const token = req.header('x-auth-token');
  if(token){
    const decoded = jwt.verify(token, config.get('jwtKey'));
    req.user = decoded;
    if(req.user.userStatus!==2 && req.user._id!==post.user_id){
      post.views = post.views+1;
      post = await post.save();
    }
  }else{
    post.views = post.views+1;
    post = await post.save();
  
  }
});


// get all posts create by user
router.get('/', async (req, res) => {
  const postsArray = await Post.find({
    user_id: req.user._id
  });
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});





// create post
router.post('/', writerAuth, async (req, res) => {

  const {
    error
  } = validatePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let post = new Post({
    name: req.body.name,
    postBody: req.body.postBody,
    author: req.body.author,
    summary: req.body.summary,
    tags: req.body.tags,
    imageUrl: req.body.imageUrl,
    postNumber: await generatePostNumber(Post),
    user_id: req.user._id
  });
  post = await post.save();
  res.send(post);
});




module.exports = router;