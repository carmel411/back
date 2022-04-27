const users = require('./routes/users');
const auth = require('./routes/auth');
const express = require('express');
const app = express();
const posts = require('./routes/posts');
const http = require('http').Server(app);
var fs = require('fs');
const mongoose = require('mongoose');
const morgan = require('morgan');
 
mongoose.connect('mongodb://localhost/poster', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

// create log file
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
app.use(morgan('combined', { stream: accessLogStream }));
app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/posts', posts);
 
const port = 3000;
http.listen(port, () => console.log(`Listening on port ${port}...`));