import { BrevoClient } from "@getbrevo/brevo";
import config from "./config.ts";

const brevo = new BrevoClient({
    apiKey: config.BREVO_API_KEY,
});

export default brevo;