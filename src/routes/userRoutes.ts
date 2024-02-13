import express from "express";
import { signUp, logIn, logOut, updateUser, getUserProfile, getSuggestedUser, freezeAccount } from "../controllers/userControllers";
import protectedRoute from "../middlewares/protectRoute";

const router = express.Router();

router.get("/profile/:query", protectedRoute, getUserProfile);
router.get("/suggested", protectedRoute, getSuggestedUser);
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);
router.put("/update/:id", protectedRoute, updateUser);
router.put("/freeze", protectedRoute, freezeAccount);

export default router;
