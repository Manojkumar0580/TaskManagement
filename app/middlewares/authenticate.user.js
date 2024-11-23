const jwt = require('jsonwebtoken');
const __res_ = require('../utils/helpers/send.response');

module.exports = async (req, res, next) => {
    const authToken = req.headers['authorization'];

    if (!authToken) {
        return __res_.out(req, res, {
            status: false,
            statusCode: 401,
            message: "Unauthorized user",
            data: 'Authorization failed. No access token provided.'
        });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.handler.unauthorized();
    }

    try {
        // Verify JWT token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODEDE======>", decodedToken)

        req.user = decodedToken;

        next();

    } catch (err) {
        console.log(err);

        return __res_.out(req, res, {
            status: false,
            statusCode: 401,
            message: "Unauthorized user",
            data: 'Authorization failed. Invalid or expired token.'
        });
    }
};
