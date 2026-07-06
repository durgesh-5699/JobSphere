import { mongoose, Schema } from 'mongoose';

export interface IRoom extends Document {
    name:string;
    descripetion?:string;
    isPublic:boolean;
    owner:mongoose.Types.ObjectId;
}

const roomSchema = new mongoose.Schema<IRoom>({
    name : {type:String,required:true,trim:true},
    description:{type:String,trim:true},
    isPublic:{type:Boolean,default:true},
    owner :{type:Schema.Types.ObjectId, ref:"User",required:true},
  },{timestamps:true}
);

const Room = mongoose.model<IRoom>("Room",roomSchema);
export default Room;