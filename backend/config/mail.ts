import nodemailer from "nodemailer";
import config from "./config.ts";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
    family :4,
});

export default transporter;