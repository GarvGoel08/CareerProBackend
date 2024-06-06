// User Controller
const User = require("../models/user");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler  = require("../utils/errorHandler");

exports.signup = catchAsyncError(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });
  const otp = Math.floor(100000 + Math.random() * 900000);
  user.otp = {
    code: otp,
    expiry: Date.now() + 5 * 60 * 1000,
  };
  await user.save();
  // Send OTP to user's email(Not implemented here)
  console.log(otp);
  res.status(201).json({
    success: true,
    message: "User registered successfully, OTP sent to your email",
  });
});

exports.verifyOTP = catchAsyncError(async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    console.log("User not found");
    return next(new ErrorHandler("User not found", 404));
  }
  // Convert user.otp.code to string
  if (String(user.otp.code) !== otp) {
    console.log("OTP Mismatch");
    return next(new ErrorHandler("Invalid OTP", 400));
  }
  if (user.otp.expiry < Date.now()) {
    console.log("OTP Exp");
    return next(new ErrorHandler("OTP expired", 400));
  }
  user.otp = undefined;
  await user.save();
  const token = user.getJWTToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.status(200).cookie("token", token, options).json({
    success: true,
    user,
  });
});

exports.login = (async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    const isPasswordMatched = await user.authenticate(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    if (user.otp.code) {
        await user.remove();
        return next(new ErrorHandler("User not verified", 401));
    }
    const token = user.getJWTToken();
    const options = {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    };
    res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
    });
});

exports.logout = catchAsyncError(async (req, res) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});

exports.deleteUsersWithExpiredOTP = catchAsyncError(async () => {
  try {
      const currentTime = Date.now();
      await User.deleteMany({
          'otp.expirationTime': { $lte: currentTime }, 
          'otp.code': { $ne: null }, 
      });
  } catch (error) {
      console.error('Error deleting users with expired OTP:', error);
  }
});