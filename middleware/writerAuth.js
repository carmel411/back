const jwt = require('jsonwebtoken');
const config = require('config');
require('dotenv').config();

module.exports = (req, res, next) => {
  console.log("writerauth active")
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('לא סופק אסימון גישה');
  try {
    const decoded = jwt.verify(token, config.get('jwtKey'));
    req.user = decoded;
    
    if(req.user.userStatus===0) return res.status(401).send("דרושה הרשאת כתיבה");
    if(req.user.userStatus===1||req.user.userStatus===2)next();
  }
  catch (ex) {
    res.status(400).send('שגיאה באסימון');
  }
}