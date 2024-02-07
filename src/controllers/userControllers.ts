import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Post from "../models/postModel";
import bcrypt, { hash } from "bcryptjs";
import generateTokenAndSetCokie from "../utils/helpers/generateTokenAndSetCokie";

/**
 *Register users
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */

const signUp = async (req: Request, res: Response) => {
  try {
    const { name, username, email, password, confirm_password } = req.body;

    // Step1: Check for the equality of password and confirm_password
    if (password !== confirm_password) {
      return res
        .status(400)
        .json("Password and Confirm Password doesn't match.");
    }

    // Step2: Check for user existence
    const user: any = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json("User already exist");
    }

    // Step3: Generate hashed password for the user
    const salt: any = await bcrypt.genSalt(10);
    const hashedPassword: any = await bcrypt.hash(password, salt);

    // Create new user from the body request
    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      confirm_password: hashedPassword,
    });
    // Step4: Save the newUser profile
    await newUser.save();

    // Step5: Validating if newUser is created and sending the response back
    if (newUser) {
      generateTokenAndSetCokie(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
      });
    } else {
      return res.status(400).json("Invalid user data");
    }
  } catch (err: any) {
    res.status(500).json({ err: err.message });
    console.log("Error in signing user up: ", err.message);
  }
};

/**
 *Login user
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    // Find user existence
    const user = await User.findOne({ username });
    // Check for the password validity
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if (!user || !isPasswordCorrect) return res.status(400).json({ error: "Invalid username or password" });

    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    generateTokenAndSetCokie(user.id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      profilePic: user.profilePic
    })
  } catch (error: any) {
    res.status(500).json({error: error.message})
  }
};

export { signUp };
