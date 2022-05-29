const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config()


var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

// send mail
router.post('/', async (req, res) => {
   const addressList = req.body.addressList
   const subject = req.body.subject
const heading = req.body.heading
const paragraph1 = req.body.paragraph1
var paragraph2 = req.body.paragraph2;
if (!paragraph2){paragraph2 = ""}

new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({

     "sender":{ "email":"not-reply@toreadandgrow.com", "name":"לקרוא ולצמוח"},
     "subject":subject,
     "htmlContent":`<!DOCTYPE html><html><body><h1>${heading}</h1><p>${paragraph1}</p><br><p>${paragraph2}</p></body></html>`,
     "params":{
        "greeting":"This is the default greeting",
        "headline":"This is the default headline"
     },
     "to":addressList

}).then(function(data) {
  console.log(data);
  res.send(data);
}, function(error) {
  console.error(error);
  res.send(error)
});





  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
//   let user = await User.findOne({ email: req.body.email });
//   if (!user) return res.status(400).send('Invalid email or password.');
//   const validPassword = await bcrypt.compare(req.body.password, user.password);
//   if (!validPassword) return res.status(400).send('Invalid email or password.');
//   res.json({ token: user.generateAuthToken(), admin: user.admin });
//  });

})
module.exports = router;