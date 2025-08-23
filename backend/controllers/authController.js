const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// SIGNUP
exports.signUp = async (req, res) => {
  const { Fname, Lname, address, landmark, pincode, email, number, password, Confirm_password } = req.body;

  if (!Fname || !Lname || !address || !landmark || !pincode || !email || !number || !password || !Confirm_password) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }
  if (password !== Confirm_password) {
    return res.status(400).json({ success: false, message: "Passwords do not match" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { number }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email or phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ Fname, Lname, address, landmark, pincode, email, number, password: hashedPassword });

    await newUser.save();

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);

    // Handle mongoose validation errors (like invalid phone number length)
    if (err.name === "ValidationError") {
      let messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }

    res.status(500).json({ success: false, message: "Server error during sign up" });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Email/Phone and password are required." });
  }

  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { number: identifier }] });
    if (!user) return res.status(401).json({ message: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    return res.status(200).json({
      message: "Login successful.",
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// EMAIL OTP VERIFICATION
exports.verifyEmailOtp = async (req, res) => {
  const { identifier, otp: enteredOtp } = req.body;

  if (!enteredOtp) return res.status(400).json({ message: "OTP is required." });

  try {
    const user = await User.findById(identifier);
    if (!user) return res.status(404).json({ message: "User not found." });

    const now = new Date();
    if (!user.otp_created_at || (now - user.otp_created_at) / 1000 > 300) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const isMatch = await bcrypt.compare(enteredOtp, user.email_otp || "");
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.email_otp = null;
    user.otp_created_at = null;
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, number: user.number }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({ message: "OTP verified successfully.", token });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword) return res.json({ success: false, message: "Phone and new password are required." });

  try {
    const user = await User.findOne({ number: phone });
    if (!user) return res.json({ success: false, message: "Mobile number not found." });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error.message);
    return res.status(500).json({ success: false, message: "Server error while updating password." });
  }
};
