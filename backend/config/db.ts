import mongoose from "mongoose";
import config from "./config.ts";

const connectDB =async()=>{
    try {
    const conn = await mongoose.connect(config.MONGO_URI);
    console.log("DB is connect to host : ",conn.connection.host);
    }catch(err:any){
     console.log("failed to connect with the DataBase : ",err.message);
     process.exit(-1);
    }
}

export default connectDB;