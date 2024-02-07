import { Response } from "express";
import jwt, {Secret} from "jsonwebtoken";

const SECRET: any = process.env.JWT_TOKEN;
const generateTokenAndSetCokie = async (userId: any, res: Response) => {
    const token = jwt.sign({ userId }, SECRET, {
        expiresIn: "15d"
    });
    res.cookie("jwt", token, {
        httpOnly: true, // more secure 
        maxAge: 15 * 60 * 60 * 1000, // 15 days
        sameSite: "strict", // CSRF
    })

    return token;
}

export default generateTokenAndSetCokie;