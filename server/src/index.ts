import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { planRouter } from "./routes/plan";
import { profileRouter } from "./routes/profile";
import path from "path";
dotenv.config();

dotenv.config({ path: path.resolve(__dirname, "../.env") });

//checks
console.log("=== ENV CHECK ===");
console.log("Database URL loaded:", !!process.env.DATABASE_URL);
console.log("OpenAI Key loaded:", !!process.env.OPENAI_API_KEY);
console.log("=================");



const app = express();
const PORT = process.env.PORT || 3001; 
app.use(cors());
app.use(cookieParser());
app.use(express.json());
//api routes
const api = express.Router();
api.use("/api/plan", planRouter);
api.use("/api/profile", profileRouter);
app.use(api);
app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});