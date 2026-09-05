const express = require('express');
const authControllere = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();
const loginLimiter = rateLimit({
    windowMs :15 * 60 * 1000,
    max:5,

    message:{
   success:false,
   message:"Too many login attempts.please try again later."
    }

})

router.post('/register',authControllere.registerUser)

router.post('/login',loginLimiter,authControllere.loginUser )
router.get('/verify-email/:token',authControllere.verifyEmail);

router.post(
    '/forgot-password',
    authControllere.forgotPassword
);

router.post(
    '/reset-password/:token',
    authControllere.resetPassword
);
    router.post(
    '/refresh-token',
    authControllere.refreshAccessToken
);
router.post(
    '/logout',
    authControllere.logoutUser
);
module.exports = router;
