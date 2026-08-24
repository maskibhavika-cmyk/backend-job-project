const errorMiddleware = (err, req, res, next) => {
    console.log(err);

    return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Something went wrong"
    });
};

module.exports = errorMiddleware;