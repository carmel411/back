const express = require('express');
const router = express.Router();
const {User, validate, validateUserWithoutPasswordAndUserstatus,validateUserWithoutUserstatusWithPassword2 ,validatePosts} = require('../models/user');
const { Post, validatePost, generatePostNumber } = require('../models/post');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth')
require('dotenv').config()
var flash = require('connect-flash');
var app = express();
app.use(flash());

var SibApiV3Sdk = require('sib-api-v3-sdk');
const { result } = require('lodash');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;


// get user info
router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');
    res.send(user);
  });

// get all users
router.get('/allusers', adminAuth, async (req, res) => {
    User.find({}).then(function (users) {
    let result = _.map(users, user => _.pick(user, ['name', 'email', 'phone','userStatus','_id']))
    // users.map((user)=>  _.pick(user, ['name', 'email', 'phone']))
      res.send(result);
      });
     });


// update user favorite list
router.patch('/posts', auth, async (req, res) => {
  let user = await User.findById(req.user._id);
  user.posts = req.body;
  user = await user.save().then(()=>{
    res.status(200).send(user);
    }).catch((err)=>{
    res.status(400).send(err);
  })});

// update user status
router.patch('/status', adminAuth, async (req, res) => {
    let user = await User.findById(req.body.id);
    user.userStatus = req.body.newStatus;
    user = await user.save().then(()=>{
      res.status(200).send();
      return
      }).catch((err)=>{
      return res.status(400).send(err);
   
  })})
  


  // register
router.post('/', async (req, res) => {
console.log(req.body.email + " trying to register " + new Date())
const user = _.pick(req.body, ['name', 'email', 'password', 'userStatus', 'posts'])
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
        console.log("new register " + new Date() + " " + resInfo);
        res.status(200).send(resInfo);
        return
        }).catch((err)=>{
        return res.status(400).send(err)
        
        }) 
}
});

  // update user
   router.patch('/update', auth, async (req, res) => {
    const user = _.pick(req.body, ['name','phone','avatar', 'email', 'password', 'password2'])
    // validate if recieve password
    if((req.body.password!==''||null||undefined) && (req.body.password===req.body.password2)){
      const {error}=await validateUserWithoutUserstatusWithPassword2(user)
      if (error){return res.status(400).send(error.details[0].message)}}
    // validate without password
    else{
      const userWithoutPassword = _.pick(req.body, ['name','phone','avatar', 'email'])
      const {error}=await validateUserWithoutPasswordAndUserstatus(userWithoutPassword)
      if (error){return res.status(400).send(error.details[0].message)}}
    
      const userToSave = new User(user);
      let updatedUser = await User.findById(req.user._id);
      updatedUser.email = req.body.email;
      updatedUser.phone = req.body.phone;
      updatedUser.avatar = req.body.avatar;
      if(req.body.password!=(""||null||undefined) && req.body.password===req.body.password2){
        const salt = await bcrypt.genSalt(10);
        let bcyptPassword = await bcrypt.hash(req.body.password, salt);
        updatedUser.password = bcyptPassword};
      updatedUser.name = req.body.name;
      updatedUser.save().then(()=>{
      let resInfo = (_.pick(updatedUser, ['_id', 'name', 'email']));

      res.status(200).send(resInfo);
      return
      }).catch((err)=>{
      return res.status(400).send(err)
      
      })});
   
 
 
 
 
 
 
    


//   forget password
router.post('/forget', async (req, res) => {
  console.log(req.body.email + " forget password " + new Date())

  let errorMessage = "";
  const randomPassword = Math.random().toString(36).slice(-8);
  const salt = await bcrypt.genSalt(10);
  const bcryptPassword = await bcrypt.hash(randomPassword, salt);
  const convertPassword = await User.findOneAndUpdate({"email":req.body.email},{"password": bcryptPassword},{ new: true });
  var mailData = ""
  new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({

      "sender":{ "email":"not-reply@toreadandgrow.com", "name":"?????????? ????????????"},
      "subject":"?????????? ??????????",
      "htmlContent":`<!DOCTYPE html><html><body><h1>???????????? ??????????</h1><p>???????????? ?????????? ??????:</p><br><p>${randomPassword}</p></body></html>`,
      "params":{
         "greeting":"This is the default greeting",
         "headline":"This is the default headline"
      },
      "to":[{"email": req.body.email}]
  
  }).then(function(data) {
  mailData = data;
  }, function(error) {
   console.error(error);
   errorMessage = error;
  });
  if (!convertPassword) res.status(400).send('?????????? ???????????? ????????' + " " + errorMessage);
  res.status(200).send(mailData);
  });

  
module.exports = router;