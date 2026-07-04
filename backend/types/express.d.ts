import { Request } from "express";
import { IJob } from "../models/jobModel";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Ya phir apna proper User type lagao instead of 'any'
    }
  }
}