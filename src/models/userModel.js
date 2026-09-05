const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    // Email Verification
    emailVerified: {
        type: Boolean,
        default: false
    },

    emailVerificationToken: {
        type: String,
        default: null
    },

    emailVerificationExpires: {
        type: Date,
        default: null
    },
    //passwod reset
    passwordResetToken: {
    type: String,
    default: null
},

passwordResetExpires: {
    type: Date,
    default: null
},


// Refresh Token
refreshToken: {
    type: String,
    default: null
},

refreshTokenExpires: {
    type: Date,
    default: null
},
refreshTokenVersion: {
    type: Number,
    default: 0
},
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;