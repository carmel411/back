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

// delete post
router.delete('/:id', auth, async (req, res) => {
  // if (!req.user.userStatus) return res.status(403).send('You need userStatus pemission to perform this action.');
  const post = await Post.findOneAndRemove({
    _id: req.params.id,
    user_id: req.user._id
  });
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post);
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
      postNumber: req.params.id
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
      postNumber: req.params.id
    });
    res.send(post)
  }
});

// get all posts
router.get('/allposts', async (req, res) => {
  const postsArray = await Post.find({});
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});

// get posts by tag
router.get('/searchtag', async (req, res) => {
  const findTag = req.query.tag
  
  const postsArray = await Post.find({tags: findTag})
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
  ],function(err,docs) { 
  }
})
  if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
  res.send(postsArray);
});


// get post by ID
router.get('/:id', async (req, res) => {
  const post = await Post.findOne({
    _id: req.params.id
  })
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post)
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
    postImage: req.body.postImage,
    postNumber: await generatePostNumber(Post),
    user_id: req.user._id
  });
  post = await post.save();
  res.send(post);
});

module.exports = router;