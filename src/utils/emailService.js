
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


// EMAIL VERIFICATION

const sendVerificationEmail = async (email, token) => {

    const verificationUrl =
        `${process.env.CLIENT_URL}/verify-email/${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your email",

        html: `
            <h2>Email Verification</h2>

            <p>Please click the button below to verify your email.</p>

            <a href="${verificationUrl}">
                Verify Email
            </a>

            <p>This link will expire in 15 minutes.</p>
        `
    });
};


// PASSWORD RESET EMAIL

const sendPasswordResetEmail = async (email, token) => {

    const resetUrl =
        `${process.env.CLIENT_URL}/reset-password/${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Your Password",

        html: `
            <h2>Password Reset</h2>

            <p>You requested to reset your password.</p>

            <p>Click the button below to reset your password.</p>

            <a href="${resetUrl}"
               style="
               display:inline-block;
               padding:10px 20px;
               background:#007bff;
               color:white;
               text-decoration:none;
               border-radius:5px;
               ">
               Reset Password
            </a>

            <p>This link will expire in 15 minutes.</p>

            <p>If you did not request this, please ignore this email.</p>
        `
    });
};


module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};