const users = require('./routes/users');
const auth = require('./routes/auth');
const mails = require('./routes/mails');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const http = require('http').Server(app);
const fs = require('fs');
const path = require('path')
const mongoose = require('mongoose');
const morgan = require('morgan');
var flash = require('connect-flash');

mongoose.connect(
  
  process.env.MONGODB_URI || 'mongodb://localhost/poster', 
  {useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

// create log file
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json({limit: '50mb'}));
// app.use(express.urlencoded({limit: '50mb'}));
app.use(flash());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/posts', posts);
app.use('/api/mails', mails);

const port = 3000;
http.listen(port, () => console.log(`Listening on port ${port}...`));