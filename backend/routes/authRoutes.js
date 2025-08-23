const express = require("express");
const router = express.Router();

const { sendOtp, verifyOtp } = require("../controllers/otpController");
const { signUp, loginUser, resetPassword, verifyEmailOtp } = require("../controllers/authController");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

router.post("/signup", signUp);
router.post("/login", loginUser);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
