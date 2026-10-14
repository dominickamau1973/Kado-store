import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    // Basic server-side validation; client-side validation is not sufficient.
    if (!normalizedName || !normalizedEmail || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Please provide name, email and password",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        message: "Password must be between 8 and 128 characters",
      });
    }

    // Check whether the email already exists.
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    //Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create the user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "User with this email already exists" });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    // Check that all fields were provided.
    if (!normalizedEmail || typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find the user by normalized email.
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    //Compare the entered password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    //Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
