const express = require('express');
const router = express.Router();
const {User, validate } = require('../models/user');
const { Post, validatePost, generatePostNumber } = require('../models/post');

const bcrypt = require('bcrypt');
const _ = require('lodash');
const auth = require('../middleware/auth');
// get user info
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
  });

// insert card to favorites
// router.post('/:id', auth, async (req, res) => {
// const { error } = validateCard(req.body);
// if (error) return res.status(400).send(error.details[0].message);
// let card = req.params.id;
//   const newFavorite = await User.findOneAndUpdate({_id: req.user._id }, {$push: {favorites: card }} );
// const newFavorite = await User.findAndModify({
//   query:{_id: req.user._id},
//   update:{$push: {card}}})

//   if (!newFavorite) return res.status(404).send('error.');
//   updatedFavorites =  User.findById(req.user._id).select('favorites');
//   res.send(updatedFavorites);
// });


 
const getPosts = async (postsArray) => {
  
  const posts = await Post.find({ "postNumber": { $in: postsArray } });
  return posts;
};
 
// get liked posts list by user
router.get('/posts', auth, async (req, res) => {
 
  if (!req.query.numbers) res.status(400).send('Missing numbers data');
 
  let data = {};
  data.posts = req.query.numbers.split(",");
 
  const posts = await getPosts(data.posts);
  res.send(posts);
  // res.send(data);
 
});

// update user posts list
router.patch('/posts', auth, async (req, res) => {
 console.log(req.body.posts);
  const { error } = validatePosts(req.body);
  if (error) res.status(400).send(error.details[0].message);
 
  const posts = await getPosts(req.body.posts);
  if (posts.length != req.body.posts.length) res.status(400).send("Post numbers don't match");
 
  let user = await User.findById(req.user._id);
  user.posts = req.body.posts;
  user = await user.save();
  res.send(user);
 
});


  // register
router.post('/', async (req, res) => {
console.log("Someone `try to register");
const user = _.pick(req.body, ['name', 'email', 'password', 'admin', 'posts'])
const {error}=await validate(user)
if (error){
return res.status(400).send(error.details[0].message)
}
else {
    let user_exist = await User.findOne({email: user.email});
    if (user_exist) return res.status(400).send('User already registered.');
    const userToSave = new User(user);
    const salt = await bcrypt.genSalt(10);
    userToSave.password = await bcrypt.hash(userToSave.password, salt);
    userToSave.favorites = [];
    userToSave.save().then(()=>{
        let resInfo = (_.pick(userToSave, ['_id', 'name', 'email']));
        res.status(200).send(resInfo);
        return
        }).catch((err)=>{
        return res.status(400).send(err)
        
        }) 
}
});


module.exports = router;