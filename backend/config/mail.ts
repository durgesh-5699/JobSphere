import nodemailer from "nodemailer"
import config from "./config"

const transporter = nodemailer.createTransport({
    service: "gmail",
    suth:{
        user : config.EMAIL_USER,
        pass : config.EMAIL_PASS,
    },
});

export default transporter;

