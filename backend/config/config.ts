import dotenv from "dotenv"
dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined");
}

if(!process.env.CLIENT_URL){
    throw new Error("CLIENT_URL is not defined");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined");
}

if(!process.env.GROQ_API_KEY){
    throw new Error("GROQ_API_KEY is not defined");
}

if(!process.env.CLOUDINARY_CLOUD_NAME){
    throw new Error("CLOUDINARY_CLOUD_NAME is not defined");
}

if(!process.env.CLOUDINARY_API_KEY){
    throw new Error("CLOUDINARY_API_KEY is not defined");
}

if(!process.env.CLOUDINARY_SECRET_KEY){
    throw new Error("CLOUDINARY_SECRET_KEY is not defined");
}

const config = {
    MONGO_URI : process.env.MONGO_URI,
    CLIENT_URL : process.env.CLIENT_URL,
    JWT_SECRET : process.env.JWT_SECRET,
    GROQ_API_KEY : process.env.GROQ_API_KEY,
    CLOUDINARY_CLOUD_NAME : process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY : process.env.CLOUDINARY_SECRET_KEY
};

export default config ;