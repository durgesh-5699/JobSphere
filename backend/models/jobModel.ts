import mongoose, { Document, Schema } from "mongoose"

export interface IJob extends Document{
  title: string;
  company: string;
  description: string;
  applyLink: string;
  location: string;
  skills: string[];
  salary?: string;
  postedBy: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
}

const jobSchema = new mongoose.Schema<IJob>({
    title:{type:String,required:true,trim:true},
    company:{type:String,required:true,trim:true},
    description:{type:String,required:true},
    applyLink:{type:String,required:true},
    location:{type:String,required:true,trim:true},
    skills:{type:[String],default:[]},
    salary:{type:String},
    postedBy:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    room: {type:Schema.Types.ObjectId, ref:"Room", required:true},
},{timestamps:true});

const Job = mongoose.model<IJob>("Job",jobSchema);
export default Job;