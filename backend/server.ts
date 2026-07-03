import express from "express"
import cors from "cors"
import config from "./config/config.ts";
import connectDB from "./config/db.ts";
import cookieParser from 'cookie-parser'
import authRouter from "./routes/authRoutes.ts";
import morgan from "morgan"

connectDB();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(cors({
    origin : config.CLIENT_URL,
    credentials:true
}));

app.use("/api/auth",authRouter);

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})