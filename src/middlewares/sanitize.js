const validator = require("validator");

const sanitizeRegisterInput = (req, res, next) => {

    if (req.body.username) {
        req.body.username = validator
            .escape(req.body.username.trim());
    }

    if (req.body.email) {
        req.body.email = validator
            .normalizeEmail(req.body.email.trim());
    }

    next();
};

const sanitizeLoginInput = (req, res, next) => {

    if (req.body.username) {
        req.body.username = req.body.username.trim();
    }

    if (req.body.email) {
        req.body.email = validator
            .normalizeEmail(req.body.email.trim());
    }

    next();
};

module.exports = {
    sanitizeRegisterInput,
    sanitizeLoginInput
};