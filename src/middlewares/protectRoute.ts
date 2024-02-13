import User from "../models/userModel";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const protectedRoute = async (req: Request, res: Response, next: NextFunction) => {
    const SECRET: any = process.env.JWT_SECRET;
    try { 
        const token: string = req.cookies.jwt;

        // Check for token existence/authorisation
        if (!token) return res.status(401).json({ message: "Unauthorised" });

        const decoded: any = jwt.verify(token, SECRET);

        const user = await User.findById(decoded.userId).select("-password").select("-confirm_password");

        (req as any).user = user;

        next();

    } catch (error: any) {
        res.status(500).json({ error: error.message });
        console.log("Error in signupUser: ", error.message);
    }
}

export default protectedRoute;