const jwt = require('jsonwebtoken');
const config = require('config');
require('dotenv').config();

module.exports = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('לא סופק אסימון גישה');
  try {
    const decoded = jwt.verify(token, config.get('jwtKey'));
    req.user = decoded;
    next();
  }
  catch (ex) {
    res.status(400).send('שגיאה באסימון');
  }
}