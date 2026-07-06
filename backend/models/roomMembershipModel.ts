import mongoose, { Schema } from "mongoose";

export interface IRoomMembership extends Document{
    room : mongoose.Types.ObjectId;
    user : mongoose.Types.ObjectId;
    status : "pending" | "approved" | "rejected";
}

const roomMembershipSchema = new mongoose.Schema<IRoomMembership>(
    {
        room : {type:Schema.Types.ObjectId, ref:"Room", required:true},
        user : {type:Schema.Types.ObjectId, ref:"User", required:true},
        status :{
            type:String,
            enum:["pending","approved","rejected"],
            default:"pending",
        },
    },
    {timestamps:true}
);

roomMembershipSchema.index({room:1, user:1},{unique:true});

const RoomMembership = mongoose.model<IRoomMembership>("RoomMembership",roomMembershipSchema);
export default RoomMembership;