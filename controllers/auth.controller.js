const config = require("../config/db.config.js");
const jwt = require("jsonwebtoken"); //JWT tokens creation (sign())

exports.verifyToken = (req, res, next) => {
    // search token in headers most commonly used for authorization
    const header = req.headers['x-access-token'] || req.headers.authorization;
    if (typeof header == 'undefined')
        return res.status(401).json({
            success: false,
            msg: "No token provided!"
        });
    const bearer = header.split(' '); // Authorization: Bearer <token>
    const token = bearer[1];
    console.log(token, config.SECRET)
    try {
        let decoded = jwt.verify(token, config.SECRET);
        req.loggedUserUsername = decoded.username; // save user ID and role into request object
        req.loggedUserId = decoded.id; // save user ID and role into request object
        req.loggedUserRole = decoded.role;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            msg: "Unauthorized!"
        });
    }
};