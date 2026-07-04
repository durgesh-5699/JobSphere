import mongoose from "mongoose";

export interface IApplication extends Document {
    user : mongoose.Types.ObjectId;
    job : mongoose.Types.ObjectId;
    appliedAt : Date;
}

const applicationSchema = new mongoose.Schema<IApplication>({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    job:{type:mongoose.Schema.Types.ObjectId,ref:"Job",required:true},
    appliedAt :{type:Date,default:Date.now()},}
    ,{timestamps:true}
)

applicationSchema.index({user:1,job:1},{unique:true});

const Application = mongoose.model<IApplication>("Application",applicationSchema);

export default Application ;