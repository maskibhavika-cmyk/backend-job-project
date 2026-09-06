

const express = require('express');

const helmet = require("helmet");

const cookieParser = require("cookie-parser");

const authRoutes = require('./routes/authRoute');

const jobRoutes = require('./routes/jobRoute');

const cors = require("cors");

const mongoSanitize = require("express-mongo-sanitize");


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());

app.use('/api/v1/auth',authRoutes)

app.use('/api/v1/job',jobRoutes)

app.use(cors({origin: "http://localhost:8080",credentials: true}));
   


module.exports = app;