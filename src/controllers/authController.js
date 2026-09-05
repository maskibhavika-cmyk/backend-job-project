const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
    sendVerificationEmail,
    sendPasswordResetEmail
} = require("../utils/emailService");


//  REGISTER USER

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Username, email and password are required"
            });
        }

        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isUserAlreadyExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Password hash
        const hash = await bcrypt.hash(password, 10);

        // Verification token
        const verificationToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Token expiry = 15 minutes
        const verificationExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hash,

            emailVerified: false,

            emailVerificationToken: verificationToken,

            emailVerificationExpires: verificationExpires
        });

        // Send verification email
        await sendVerificationEmail(
            user.email,
            verificationToken
        );

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Registration failed",
            error: error.message
        });
    }
}


// LOGIN USER

async function loginUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!password) {
            return res.status(400).json({
                message: "Password is required"
            });
        }

        if (!username && !email) {
            return res.status(400).json({
                message: "Username or email is required"
            });
        }

        const user = await userModel.findOne({
            $or: [
                ...(username ? [{ username }] : []),
                ...(email ? [{ email }] : [])
            ]
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        if (!user.password) {
            return res.status(500).json({
                message: "Password is not stored for this user in database"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        
const accessToken = jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m"
    }
);

// Refresh Token
const refreshToken = jwt.sign(
    {
        id: user._id,
        version: user.refreshTokenVersion
    },
    process.env.JWT_REFRESH_SECRET,
    {
        expiresIn: "7d"
    }
);
// Refresh token database mein save
user.refreshToken = refreshToken;

user.refreshTokenExpires = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
);

await user.save();

// Access token cookie
res.cookie("token", accessToken);
return res.status(200).json({
    message: "User login successfully",

    accessToken: accessToken,

    refreshToken: refreshToken,

    user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Login failed",
            error: error.message
        });
    }
}


// VERIFY EMAIL 

async function verifyEmail(req, res) {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required"
            });
        }

        const user = await userModel.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token"
            });
        }

        user.emailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Email verification failed",
            error: error.message
        });
    }
}
// FORGOT PASSWORD

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const user = await userModel.findOne({ email });

        // Same response for security
        if (!user) {
            return res.status(200).json({
                message: "If this email exists, a reset link has been sent"
            });
        }

        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        user.passwordResetToken = resetToken;

        user.passwordResetExpires = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await user.save();

        await sendPasswordResetEmail(
            user.email,
            resetToken
        );

        return res.status(200).json({
            message: "If this email exists, a reset link has been sent"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Forgot password failed"
        });
    }
}
// RESET PASSWORD

async function resetPassword(req, res) {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token) {
            return res.status(400).json({
                message: "Reset token is required"
            });
        }

        if (!password) {
            return res.status(400).json({
                message: "New password is required"
            });
        }

        const user = await userModel.findOne({
            passwordResetToken: token,
            passwordResetExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        const hash = await bcrypt.hash(password, 10);

        user.password = hash;

        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        return res.status(200).json({
            message: "Password reset successfully"
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Password reset failed"
        });
    }
}
// REFRESH ACCESS TOKEN
async function refreshAccessToken(req, res) {
    try {

        const { refreshToken } = req.body;

        //  Refresh token check
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        //  Refresh token verify
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        //  User find
        const user = await userModel.findById(
            decoded.id
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        //  Token database se match karo
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Expiry check
        if (
            user.refreshTokenExpires &&
            user.refreshTokenExpires < new Date()
        ) {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });
        }

        // Token version check
        if (
            decoded.version !== user.refreshTokenVersion
        ) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is no longer valid"
            });
        }

        
        // TOKEN ROTATION
       
        //  Version increase
        user.refreshTokenVersion += 1;

        //  New Access Token
        const newAccessToken = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m"
            }
        );

        //  New Refresh Token
        const newRefreshToken = jwt.sign(
            {
                id: user._id,
                version: user.refreshTokenVersion
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: "7d"
            }
        );

        //  New refresh token DB mein save
        user.refreshToken = newRefreshToken;

        user.refreshTokenExpires = new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        );

        await user.save();

        //  Response
        return res.status(200).json({
            success: true,
            message: "Token rotated successfully",

            accessToken: newAccessToken,

            refreshToken: newRefreshToken
        });

    } catch (error) {

        console.log(error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
}
// LOGOUT USER / REVOKE REFRESH TOKEN

async function logoutUser(req, res) {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // User find karo
        const user = await userModel.findOne({
            refreshToken: refreshToken
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token"
            });
        }

        // Refresh token revoke
        user.refreshToken = null;

        user.refreshTokenExpires = null;

        // Version increase
        user.refreshTokenVersion += 1;

        await user.save();

        // Access token cookie clear
        res.clearCookie("token");

        return res.status(200).json({
            success: true,
            message: "Logout successful. Refresh token revoked."
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
}
module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
    refreshAccessToken, logoutUser,
};