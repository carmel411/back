const express = require('express');
const _ = require('lodash');
const { Post, validatePost, generatePostNumber } = require('../models/post');
const auth = require('../middleware/auth');
const router = express.Router();
// delete post
router.delete('/:id', auth, async (req, res) => {
  if (!req.user.admin) return res.status(403).send('You need admin pemission to perform this action.');
  const post = await Post.findOneAndRemove({ _id: req.params.id, user_id: req.user._id });
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  res.send(post);
});
// edit post
router.put('/:id', auth, async (req, res) => {
  if (!req.user.admin) return res.status(403).send('You need admin pemission to perform this action.');
  const { error } = validatePost(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let post = await Post.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, req.body);
  if (!post) return res.status(404).send('The post with the given ID was not found.');
  post = await Post.findOne({ _id: req.params.id, user_id: req.user._id });
  res.send(post);
});
// get post by ID
router.get('/:id', auth, async (req, res) => {
    const post = await Post.findOne({ _id: req.params.id, user_id: req.user._id});
    if (!post) return res.status(404).send('The post with the given ID was not found.');
    res.send(post);
  });
// get all posts create by user
router.get('/', auth, async (req, res) => {
  const postsArray = await Post.find({user_id: req.user._id});
    if (!postsArray) return res.status(404).send('The post with the given USER ID was not found.');
    res.send(postsArray);
  });
// create post
router.post('/', auth, async (req, res) => {
  if (!req.user.admin) return res.status(403).send('You need admin pemission to perform this action.');

  const { error } = validatePost(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let post = new Post(
      {
        postName: req.body.postName,
        postBody: req.body.postBody,
        postColor: req.body.postColor,
        tags: req.body.tags,
        postImage: req.body.postImage ? req.body.postImage : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        postNumber: await generatePostNumber(Post),
        user_id: req.user._id
      }
    );
    post = await post.save();
    res.send(post);
  });

module.exports = router;