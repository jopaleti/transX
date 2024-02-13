import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const generateTokenAndSetCokie = async (userId: any, res: Response) => {
  const SECRET: any = process.env.JWT_SECRET;
  // Generate token before adding it
  const token = jwt.sign({ userId }, SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    httpOnly: true, // more secure
    maxAge: 15 * 60 * 60 * 1000, // 15 days
    sameSite: "strict", // CSRF
  });

  return token;
};

export default generateTokenAndSetCokie;

