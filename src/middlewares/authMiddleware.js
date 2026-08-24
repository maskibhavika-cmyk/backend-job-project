// const mongoose = require('mongoose')

// //schema
// const userSchema = new mongoose.Schema({
// }) 
// //export
// module.exports = mongoose.model('User',userSchema);

// ).send({

//         success: false,
//         message: "Token not provided",
//       });
//     }

//     console.log("Token:", token);

//     const decode = JWT.verify(token, process.env.JWT_SECRET);

//     req.user = decode;
//     next();

//   } catch (error) {
//     console.log(error);

//     return res.status(401).send({
//       success: false,
//       message: "Invalid or Expired Token",
//       error: error.message,
//     });
//   }
// };

// const jwt = require("jsonwebtoken");

// const authUser = (req, res, next) => {
//     try {
//         const token = req.cookies.token;

//         if (!token) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized - Token not found"
//             });
//         }

//         const decoded = jwt.verify(
//             token,
//             process.env.JWT_SECRET
//         );

//         req.user = decoded;

//         next();

//     } catch (error) {
//         console.log(error);

//         return res.status(401).json({
//             success: false,
//             message: "Invalid or expired token"
//         });
//     }
// };

// module.exports = { authUser };const JWT = require("jsonwebtoken");

// module.exports = async (req, res, next) => {
//   try {
//     // Get Authorization Header
//     const authHeader = req.headers.authorization;

//     if (!authHeader) {
//       return res.status(401).send({
//         success: false,
//         message: "Authorization header is missing",
//       });
//     }

//     // Header format: Bearer <token>
//     const token = authHeader.trim().split(/\s+/)[1];

//     if (!token) {
//       return res.status(401

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Token not found"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = { authMiddleware};