import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes"

dotenv.config();

// Establish database connection
connectDB();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("God is great!!!!!");
});


// Middlewares
app.use(express.json({ limit: "50mb" })) // To parse JSON data in the req.body
app.use(express.urlencoded({ extended: true })) // To parse form data in the req.body
app.use(cookieParser());

// Routes
app.use("/api/v1/user", userRoutes);

app
  .listen(port, () => {
    console.log(`Server listening on port ${port}`);
  })
  .on("error", (e) => console.error(e));
