const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register User
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

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        const token = jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);
        // const token = jwt.sign(
        //     {
        //         id: user._id
        //     },
        //     process.env.JWT_SECRET
        // );

        res.cookie("token", token);

        return res.status(201).json({
            message: "User registered successfully",
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


// Login User
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

        

        const token = jwt.sign(
    {
        id: user._id,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "1d"
    }
);

        res.cookie("token", token);

        return res.status(200).json({
            message: "User login successfully",
            token: token,
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


module.exports = {
    registerUser,
    loginUser
};