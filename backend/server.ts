import express from "express"
import cors from "cors"
import config from "./config/config.ts";
import connectDB from "./config/db.ts";
import cookieParser from 'cookie-parser'
import authRouter from "./routes/authRoutes.ts";
import morgan from "morgan"
import jobRouter from "./routes/jobRoutes.ts";
import applicationRouter from "./routes/applicationRoutes.ts";
import aiRouter from "./routes/aiRoutes.ts";
import profileRouter from "./routes/profileRoutes.ts";
import roomRouter from "./routes/roomRoutes.ts";
import dns from "dns"

connectDB();

dns.setDefaultResultOrder("ipv4first");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
    origin : config.CLIENT_URL,
    credentials:true
}));

app.use("/api/auth",authRouter);
app.use("/api/jobs",jobRouter);
app.use("/api/applications",applicationRouter);
app.use("/api/ai",aiRouter);
app.use("/api/profile",profileRouter);
app.use("/api/rooms",roomRouter);

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})