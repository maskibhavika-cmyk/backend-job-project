const express = require("express");

const authControllere = require("../controllers/authController");

const { loginLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

const {sanitizeRegisterInput,  sanitizeLoginInput} = require("../middlewares/sanitize");
    
// REGISTER
router.post( "/register", authControllere.registerUser);
  


// LOGIN
router.post("/login", loginLimiter,authControllere.loginUser);
    

// VERIFY EMAIL
router.get( "/verify-email/:token", authControllere.verifyEmail);
   

// FORGOT PASSWORD
router.post("/forgot-password", authControllere.forgotPassword);

    


// RESET PASSWORD
router.post( "/reset-password/:token", authControllere.resetPassword);
   


// REFRESH TOKEN
router.post( "/refresh-token",authControllere.refreshAccessToken);
    


// LOGOUT
router.post( "/logout",authControllere.logoutUser);
    
// input sanitization
router.post( "/register",sanitizeRegisterInput, authControllere.registerUser);
   
module.exports = router;