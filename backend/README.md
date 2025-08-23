# Backend API - Authentication System

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in the backend folder with:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://nitinrawat4428:geh1eIEfPkBsiQeu@authsystem.r2tvtd1.mongodb.net/?retryWrites=true&w=majority&appName=AuthSystem

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Server Configuration
PORT=5000
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Start Server
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login (redirects to frontend)
- `POST /api/verify-email-otp` - Email OTP verification
- `POST /api/reset-password` - Password reset

### OTP Management
- `POST /api/send-otp` - Send SMS OTP via Twilio
- `POST /api/verify-otp` - Verify SMS OTP

## Features
- MongoDB with Mongoose ODM
- Bcrypt password hashing
- JWT token generation
- Twilio SMS integration
- Rate limiting (configurable)
- OTP attempt tracking with cooldown

## Database Schema
The User model includes all necessary fields for authentication, OTP management, and security features.
