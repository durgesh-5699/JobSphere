// 1 & 2. Fixed the imports to correctly include mongoose and Document
import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string; // 3. Fixed typo here
    isPublic: boolean;
    owner: mongoose.Types.ObjectId;
}

const roomSchema = new Schema<IRoom>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        isPublic: { type: Boolean, default: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// 4. Added the OverwriteModelError fix
export const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", roomSchema);

export default Room;