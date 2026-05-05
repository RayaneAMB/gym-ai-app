import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { planRouter } from "./routes/plan";
import { profileRouter } from "./routes/profile";
import path from "path";
dotenv.config();

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 👈 VERIFICATION CHECKS: This will print true/false in your terminal
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
app.listen(3001, "127.0.0.1", () => {
    console.log("Server is firmly locked on http://127.0.0.1:3001");
});