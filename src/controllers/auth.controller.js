const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailServices = require("../services/email.services");

/*User Register Controller */
async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const isExists = await UserModel.findOne({ email });

    if (isExists) {
      return res.status(409).json({
        message: "User already exists with this email.",
        status: "failed"
      });
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      name
    });

    // 🔥 EMAIL LOCATION FIXED (moved inside try, before return)
    emailServices
      .sendRegistrationEmail(user.email, user.name)
      .catch(err => console.error("Email error:", err));

    // Generate token
    const token = jwt.sign(
      { userID: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      sameSite: "lax"
    });

    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
}

/*User Login Controller */
async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        status: "failed"
      });
    }

    // Find user + include password
    const user = await UserModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found with this email",
        status: "failed"
      });
    }

    // Compare password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
        status: "failed"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userID: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax"
    });

    // Send response
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    });

  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController
};