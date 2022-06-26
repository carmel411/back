const users = require('./routes/users');
const auth = require('./routes/auth');
const mails = require('./routes/mails');
const express = require('express');
var router = express.Router();
const app = express();
const posts = require('./routes/posts');
const http = require('http').Server(app);
const fs = require('fs');
const path = require('path')
const mongoose = require('mongoose');
const morgan = require('morgan');
var flash = require('connect-flash');
var cors = require('cors')

app.use(express.static(path.join(__dirname, "app")));

// app.use(cors())
app.use(cors({
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  optionsSuccessStatus: 200,
  origin: 'https://readandgrow.web.app'
}));
app.options('*', cors());


// app.use(function (req, res, next) {

//   res.setHeader('Access-Control-Allow-Origin', 'https://readandgrow.web.app/');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   res.setHeader('Access-Control-Allow-Credentials', true);
  
//   next();
//   });

mongoose.connect(
  // TODO: לפני העלאה לאפשר
  process.env.MONGODB_URI ||
   'mongodb://localhost/poster', 
  {useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...'));

  router.get('/', function (req, res) {
    res.send('server OK');
  })
  

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


const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});