const jwt = require("jsonwebtoken");
const env = require("../../env");
module.exports = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.body.token, env.SECRET_KEY);
    req.userData = decoded;
    // res.locals.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Auth failed"
    });
  }
};
