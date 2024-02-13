import { Request, Response, NextFunction } from "express";
import User from "../models/userModel";
import Post from "../models/postModel";
import bcrypt, { hash } from "bcryptjs";
import generateTokenAndSetCokie from "../utils/helpers/generateTokenAndSetCokie";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

/**
 *Register users
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */

const signUp = async (req: Request, res: Response, next: NextFunction) => {
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

const logIn = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    // Find user existence
    const user = await User.findOne({ username });
    // Check for the password validity
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });

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
      profilePic: user.profilePic,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log("Error in loginUser: ", error.message);
  }
};

/**
 *LogOut user
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */

const logOut = async (req: Request, res: Response) => {
  try {
    /**
     * Loggin user out
     * Reset the cookie in the browser from generateTokenAndSetCookie to empty string
     * Send successful message to the user
     */

    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200);
  } catch (error: any) {
    res.status(200).json({ error: error.message });
  }
};

/**
 *LogOut user
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const getUserProfile = async (req: Request, res: Response) => {
  /**
   * Fetch user profile either with username or userId
   * Query is either username or userId
   */

  const { query } = req.params;

  try {
    // user declaration
    let user;

    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    // If user not exist
    if (!user) return res.status(404).json({ error: "User not found." });

    // If user is found, return user data as a response
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log("Error in getting user profile: ", error);
  }
};

/**
 *Update user
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  // Extracting the details to update users profile
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  // Get user Id
  const userId: any = (req as any).user._id;

  try {
    // Finding user by Id
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check for the matches of params id and userId
    if (req.params.id !== userId.toString()) {
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        // Extracting the public_id from the profilePic URL
        const publicId: any = user.profilePic.split("/").pop()?.split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }
    // Saving the user data in the database
    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    // Save user
    user = await user.save();

    // Find all posts that this user replied and update username and profilePic fields
    await Post.updateMany(
      { "comments.userId": userId },
      {
        $set: {
          "comments.$[comment].username": user.username,
          "comments.$[comment].userProfilePic": user.profilePic,
        },
      },
      {
        arrayFilters: [{ "comment.userId": userId }],
      }
    );

    // Set user password and confirm password to null and send the response back
    user.password = "";
    user.confirm_password = "";

    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
    console.log("Error in updateUser: ", error.message);
  }
};

/**
 *Get suggested users
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */
const getSuggestedUser = async (req: Request, res: Response) => {
  try {
    // exclude the current user from suggested users array and exclude users that current user is already following
    const userId = (req as any).user._id;
    const usersFollowedByYou = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filterUsers = users.filter(
      (user) => !usersFollowedByYou?.following?.includes(user._id)
    );
    const suggetedUsers = filterUsers.slice(0, 4);

    // Setting suggested users password to null before returning them as responses

    suggetedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggetedUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 *Freesing user account
 * @param {object} req
 * @param {object} res
 * @returns {object} success message
 */

const freezeAccount = async (req: Request, res: Response) => {
  try {
    // Note that user id will be returned once user is  authenticated
    const user = await User.findById((req as any).user._id);
    // Verify if the user exist or not
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export {
  signUp,
  logIn,
  logOut,
  updateUser,
  getUserProfile,
  getSuggestedUser,
  freezeAccount,
};
