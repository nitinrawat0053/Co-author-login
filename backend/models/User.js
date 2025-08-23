// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Fname: { type: String, required: true },
    Lname: { type: String, required: true },
    address: { type: String, required: true },
    landmark: { type: String, required: true },
    pincode: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v); // must be exactly 10 digits
            },
            message: "Invalid mobile number"
        }
    },
    password: { type: String, required: true },
    email_otp: { type: String, default: null },
    otp_created_at: { type: Date, default: null },
    otp_attempts: { type: String, default: null },
    otp_attempt_count: { type: Number, default: 0 },
    otp_cooldown_until: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
